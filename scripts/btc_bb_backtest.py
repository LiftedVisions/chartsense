#!/usr/bin/env python3
"""
BTC Perpetual Futures — Bollinger Band Bounce Strategy Backtester
Symbol : PI_XBTUSD (Kraken Futures)
TF     : 5-minute candles
Goal   : Beat 70% win-rate baseline, find highest-expectancy entry/exit combos
         and diagnose early stop-out patterns.

Usage:
  python3 scripts/btc_bb_backtest.py
  python3 scripts/btc_bb_backtest.py --days 90 --symbol PI_ETHUSD
"""

import json
import time
import sys
import argparse
import urllib.request
from datetime import datetime, timezone
from dataclasses import dataclass

# ─────────────────────────────────────────────────────────────────────────────
# Data Fetching  (Kraken Futures Charts API — no auth required)
# ─────────────────────────────────────────────────────────────────────────────

FUTURES_CHARTS = "https://futures.kraken.com/api/charts/v1"

def fetch_ohlcv(symbol="PI_XBTUSD", resolution="5m", days=60) -> list[dict]:
    """Paginate the Kraken Futures charts API and return sorted candle list."""
    now   = int(time.time())
    start = now - days * 86400
    candles: dict[int, dict] = {}

    print(f"  Fetching {symbol} {resolution} ({days} days)...", end="", flush=True)
    cursor = start
    pages  = 0
    while True:
        url = f"{FUTURES_CHARTS}/trade/{symbol}/{resolution}?from={cursor}&to={now}"
        try:
            with urllib.request.urlopen(url, timeout=15) as r:
                data = json.loads(r.read())
        except Exception as e:
            print(f"\n  Fetch error: {e}", file=sys.stderr)
            break

        batch = data.get("candles", [])
        for c in batch:
            ts = c["time"] // 1000  # ms → s
            candles[ts] = {
                "t": ts,
                "o": float(c["open"]),
                "h": float(c["high"]),
                "l": float(c["low"]),
                "c": float(c["close"]),
                "v": float(c["volume"]),
            }

        pages += 1
        print(".", end="", flush=True)

        if not data.get("more_candles") or not batch:
            break
        cursor = batch[-1]["time"] // 1000 + 1
        time.sleep(0.3)

    result = sorted(candles.values(), key=lambda x: x["t"])
    print(f" {len(result)} candles ({pages} pages)")
    return result


# ─────────────────────────────────────────────────────────────────────────────
# Indicators
# ─────────────────────────────────────────────────────────────────────────────

def calc_bb(candles: list[dict], period=20, std_mult=2.0) -> list[dict]:
    closes = [c["c"] for c in candles]
    out    = [{"mid": None, "upper": None, "lower": None}] * len(closes)
    for i in range(period - 1, len(closes)):
        win = closes[i - period + 1 : i + 1]
        sma = sum(win) / period
        std = (sum((x - sma) ** 2 for x in win) / period) ** 0.5
        out[i] = {"mid": sma, "upper": sma + std_mult * std, "lower": sma - std_mult * std}
    return out


def calc_rsi(candles: list[dict], period=9) -> list:
    closes = [c["c"] for c in candles]
    rsi    = [None] * len(closes)
    if len(closes) <= period:
        return rsi

    gains = [max(closes[i] - closes[i-1], 0) for i in range(1, period + 1)]
    losses = [max(closes[i-1] - closes[i], 0) for i in range(1, period + 1)]
    ag, al = sum(gains) / period, sum(losses) / period

    for i in range(period, len(closes)):
        if i > period:
            diff = closes[i] - closes[i-1]
            ag = (ag * (period - 1) + max(diff, 0))  / period
            al = (al * (period - 1) + max(-diff, 0)) / period
        rsi[i] = 100 if al == 0 else 100 - 100 / (1 + ag / al)
    return rsi


def calc_atr(candles: list[dict], period=14) -> list:
    atr = [None] * len(candles)
    trs = []
    for i in range(1, len(candles)):
        c, p = candles[i], candles[i-1]
        tr = max(c["h"] - c["l"], abs(c["h"] - p["c"]), abs(c["l"] - p["c"]))
        trs.append(tr)
        if len(trs) >= period:
            atr[i] = sum(trs[-period:]) / period
    return atr


# ─────────────────────────────────────────────────────────────────────────────
# Trade Engine
# ─────────────────────────────────────────────────────────────────────────────

@dataclass
class Trade:
    entry_ts   : int
    exit_ts    : int
    entry_price: float
    exit_price : float
    stop_price : float
    pnl_pct    : float
    win        : bool
    exit_reason: str
    candles_held: int


def run_strategy(candles, bbs, entry_fn, exit_fn, stop_fn, max_bars=48) -> list[Trade]:
    trades: list[Trade] = []
    in_trade = False
    entry_price = stop_price = 0.0
    entry_ts = entry_bar = 0

    for i in range(1, len(candles)):
        if bbs[i]["lower"] is None:
            continue

        c = candles[i]

        if not in_trade:
            ep = entry_fn(i, candles, bbs)
            if ep is not None:
                in_trade    = True
                entry_price = ep
                stop_price  = stop_fn(i, candles, bbs, ep)
                entry_ts    = c["t"]
                entry_bar   = i

        else:
            bars_held = i - entry_bar

            # Stop loss
            if c["l"] <= stop_price:
                hit = min(c["o"], stop_price)  # gap-down fill at open if needed
                trades.append(Trade(
                    entry_ts, c["t"], entry_price, hit, stop_price,
                    (hit - entry_price) / entry_price * 100,
                    False, "stop", bars_held
                ))
                in_trade = False
                continue

            # Max-bars timeout exit at close
            if bars_held >= max_bars:
                pnl = (c["c"] - entry_price) / entry_price * 100
                trades.append(Trade(
                    entry_ts, c["t"], entry_price, c["c"], stop_price,
                    pnl, pnl > 0, "timeout", bars_held
                ))
                in_trade = False
                continue

            ep2 = exit_fn(i, candles, bbs, entry_price)
            if ep2 is not None:
                pnl = (ep2 - entry_price) / entry_price * 100
                trades.append(Trade(
                    entry_ts, c["t"], entry_price, ep2, stop_price,
                    pnl, pnl > 0, "target", bars_held
                ))
                in_trade = False

    return trades


# ─────────────────────────────────────────────────────────────────────────────
# Entry Rules
# ─────────────────────────────────────────────────────────────────────────────

def e_close_touches_lower(i, candles, bbs):
    """Close at or below lower BB — baseline signal."""
    lower = bbs[i]["lower"]
    c     = candles[i]
    if lower and c["c"] <= lower:
        return c["c"]

def e_wick_reject(i, candles, bbs):
    """Wick pierces lower BB but close is back above it (pin-bar rejection)."""
    lower = bbs[i]["lower"]
    c     = candles[i]
    if lower and c["l"] <= lower and c["c"] > lower:
        return c["c"]

def e_bounce_confirm(i, candles, bbs):
    """
    YOUR CURRENT STRATEGY:
    Prev candle touches lower BB (first touch), current candle closes above the band
    (the 'confirmation' candle that shows price is bouncing).
    """
    if i < 1:
        return None
    prev_lower = bbs[i-1]["lower"]
    curr_lower = bbs[i]["lower"]
    pc = candles[i-1]
    cc = candles[i]
    if (prev_lower and pc["l"] <= prev_lower and
            curr_lower and cc["c"] > curr_lower):
        return cc["c"]

def e_two_bar_confirm(i, candles, bbs):
    """
    Stricter: two consecutive closes above lower BB after a touch
    (waits one extra bar to weed out weak bounces).
    """
    if i < 2:
        return None
    lower_m2 = bbs[i-2]["lower"]
    lower_m1 = bbs[i-1]["lower"]
    curr_lower = bbs[i]["lower"]
    c_m2, c_m1, c0 = candles[i-2], candles[i-1], candles[i]
    if (lower_m2 and c_m2["l"] <= lower_m2 and       # touch 2 bars ago
            lower_m1 and c_m1["c"] > lower_m1 and     # first confirm
            curr_lower and c0["c"] > curr_lower):      # second confirm
        return c0["c"]

def e_wick_then_confirm(i, candles, bbs):
    """
    Best of both worlds: prev candle WICKS below band (not close),
    current candle confirms with close above band.
    """
    if i < 1:
        return None
    pc = candles[i-1]
    cc = candles[i]
    prev_lower = bbs[i-1]["lower"]
    curr_lower = bbs[i]["lower"]
    if (prev_lower and pc["l"] < prev_lower and pc["c"] >= prev_lower and  # wick only
            curr_lower and cc["c"] > curr_lower):
        return cc["c"]

def make_rsi_bounce(rsi_vals, threshold=40):
    """BB bounce confirm AND RSI below threshold (oversold filter)."""
    def _entry(i, candles, bbs):
        base = e_bounce_confirm(i, candles, bbs)
        if base is None:
            return None
        r = rsi_vals[i]
        if r is not None and r <= threshold:
            return base
    return _entry

def make_rsi_wick(rsi_vals, threshold=40):
    """Wick-reject confirm AND RSI below threshold."""
    def _entry(i, candles, bbs):
        base = e_wick_then_confirm(i, candles, bbs)
        if base is None:
            return None
        r = rsi_vals[i]
        if r is not None and r <= threshold:
            return base
    return _entry

def make_volume_confirm(entry_fn, vol_mult=1.2):
    """Any entry rule + volume must be >N× recent average (conviction filter)."""
    def _entry(i, candles, bbs):
        if i < 10:
            return None
        base = entry_fn(i, candles, bbs)
        if base is None:
            return None
        avg_vol = sum(c["v"] for c in candles[i-10:i]) / 10
        if avg_vol > 0 and candles[i]["v"] >= avg_vol * vol_mult:
            return base
    return _entry


# ─────────────────────────────────────────────────────────────────────────────
# Stop Loss Rules
# ─────────────────────────────────────────────────────────────────────────────

def stop_fixed(pct):
    def _stop(i, candles, bbs, entry):
        return entry * (1 - pct)
    return _stop

def stop_below_lower_bb(i, candles, bbs, entry):
    """Place stop 0.3% below the lower band itself (band-relative)."""
    lower = bbs[i]["lower"]
    return lower * 0.997 if lower else entry * 0.98

def stop_below_candle_low(i, candles, bbs, entry):
    """Stop just below the signal candle's low."""
    return candles[i]["l"] * 0.998

def make_atr_stop(atr_vals, mult=1.5):
    def _stop(i, candles, bbs, entry):
        a = atr_vals[i]
        return entry - mult * a if a else entry * 0.98
    return _stop


# ─────────────────────────────────────────────────────────────────────────────
# Exit Rules
# ─────────────────────────────────────────────────────────────────────────────

def exit_mid_bb(i, candles, bbs, entry):
    mid = bbs[i]["mid"]
    if mid and candles[i]["h"] >= mid:
        return mid

def exit_upper_bb(i, candles, bbs, entry):
    upper = bbs[i]["upper"]
    if upper and candles[i]["h"] >= upper:
        return upper

def make_fixed_target(pct):
    def _exit(i, candles, bbs, entry):
        target = entry * (1 + pct)
        if candles[i]["h"] >= target:
            return target
    return _exit

def exit_mid_or_upper(i, candles, bbs, entry):
    """Scale out: half at mid-BB, half at upper-BB — modelled as upper."""
    upper = bbs[i]["upper"]
    if upper and candles[i]["h"] >= upper:
        return upper
    mid = bbs[i]["mid"]
    if mid and candles[i]["h"] >= mid:
        return mid


# ─────────────────────────────────────────────────────────────────────────────
# Stats
# ─────────────────────────────────────────────────────────────────────────────

def stats(trades: list[Trade]) -> dict:
    if not trades:
        return dict(n=0, wr=0, aw=0, al=0, rr=0, exp=0, pnl=0)
    wins   = [t for t in trades if t.win]
    losses = [t for t in trades if not t.win]
    wr  = len(wins) / len(trades) * 100
    aw  = sum(t.pnl_pct for t in wins)   / len(wins)   if wins   else 0
    al  = sum(t.pnl_pct for t in losses) / len(losses) if losses else 0
    rr  = abs(aw / al) if al != 0 else 0
    exp = (wr / 100) * aw + (1 - wr / 100) * al
    return dict(n=len(trades), wr=wr, aw=aw, al=al, rr=rr, exp=exp,
                pnl=sum(t.pnl_pct for t in trades))


# ─────────────────────────────────────────────────────────────────────────────
# Loss Pattern Analyser
# ─────────────────────────────────────────────────────────────────────────────

def analyse_losses(trades: list[Trade], candles: list[dict], bbs: list[dict]):
    losers  = [t for t in trades if not t.win]
    winners = [t for t in trades if t.win]
    if not losers:
        print("  No losing trades to analyse.")
        return

    # Build candle index for fast lookup
    ts_idx = {c["t"]: i for i, c in enumerate(candles)}

    # How far did price fall below the lower BB after entry before stopping out?
    depths = []
    for t in losers:
        idx = ts_idx.get(t.entry_ts)
        if idx is None:
            continue
        entry_lower = bbs[idx]["lower"] or t.entry_price
        min_low = t.entry_price
        # scan forward up to 20 bars
        for j in range(idx, min(idx + 20, len(candles))):
            min_low = min(min_low, candles[j]["l"])
            if candles[j]["t"] == t.exit_ts:
                break
        depth = (min_low - t.entry_price) / t.entry_price * 100
        depths.append(depth)

    avg_depth = sum(depths) / len(depths) if depths else 0
    print(f"  Losing trades : {len(losers)}")
    print(f"  Avg depth below entry before stop: {avg_depth:.2f}%")
    print(f"  Trades stopped within 5 bars  : "
          f"{sum(1 for t in losers if t.candles_held <= 5)}")
    print(f"  Trades stopped within 10 bars : "
          f"{sum(1 for t in losers if t.candles_held <= 10)}")
    if winners:
        print(f"  Avg bars held (wins)  : {sum(t.candles_held for t in winners)/len(winners):.1f}")
        print(f"  Avg bars held (losses): {sum(t.candles_held for t in losers)/len(losers):.1f}")

    print(f"\n  10 worst stop-outs:")
    for t in sorted(losers, key=lambda x: x.pnl_pct)[:10]:
        dt = datetime.fromtimestamp(t.entry_ts, tz=timezone.utc)
        print(f"    {dt.strftime('%Y-%m-%d %H:%M')}  entry ${t.entry_price:,.0f}  "
              f"stop ${t.stop_price:,.0f}  pnl {t.pnl_pct:.2f}%  "
              f"held {t.candles_held} bars")


# ─────────────────────────────────────────────────────────────────────────────
# Main
# ─────────────────────────────────────────────────────────────────────────────

def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--days",   type=int,  default=60,          help="Days of history")
    ap.add_argument("--symbol", type=str,  default="PI_XBTUSD", help="Futures symbol")
    ap.add_argument("--min-trades", type=int, default=8,        help="Min trades to show")
    args = ap.parse_args()

    print("=" * 72)
    print(" BTC Perpetual Futures — Bollinger Band Bounce Backtester")
    print(f" Symbol: {args.symbol}  |  TF: 5m  |  History: {args.days} days")
    print("=" * 72)

    candles = fetch_ohlcv(args.symbol, "5m", args.days)
    if len(candles) < 200:
        print("ERROR: Not enough candle data. Exiting.")
        sys.exit(1)

    print(f"\n  Total candles: {len(candles)} "
          f"({candles[0]['t']//1 and datetime.fromtimestamp(candles[0]['t'], tz=timezone.utc).strftime('%Y-%m-%d')} "
          f"→ {datetime.fromtimestamp(candles[-1]['t'], tz=timezone.utc).strftime('%Y-%m-%d')})\n")

    # Pre-compute indicators
    rsi9   = calc_rsi(candles, 9)
    rsi14  = calc_rsi(candles, 14)
    atr14  = calc_atr(candles, 14)

    results = []

    for bb_period in [15, 20]:
        for bb_std in [1.5, 2.0, 2.5]:
            bbs  = calc_bb(candles, bb_period, bb_std)
            tag  = f"BB({bb_period},{bb_std:.1f})"
            astop = make_atr_stop(atr14, 1.5)

            entries = [
                ("close_touch",       e_close_touches_lower),
                ("wick_reject",       e_wick_reject),
                ("bounce_confirm",    e_bounce_confirm),         # ← your current
                ("two_bar_confirm",   e_two_bar_confirm),
                ("wick+confirm",      e_wick_then_confirm),
                ("bounce+RSI9≤40",    make_rsi_bounce(rsi9,  40)),
                ("bounce+RSI9≤35",    make_rsi_bounce(rsi9,  35)),
                ("bounce+RSI14≤40",   make_rsi_bounce(rsi14, 40)),
                ("wick+RSI9≤40",      make_rsi_wick(rsi9,    40)),
                ("bounce+vol×1.2",    make_volume_confirm(e_bounce_confirm, 1.2)),
                ("wick+vol×1.2",      make_volume_confirm(e_wick_then_confirm, 1.2)),
            ]

            exits = [
                ("exit@midBB",    exit_mid_bb),
                ("exit@upperBB",  exit_upper_bb),
                ("exit@+1.5%",    make_fixed_target(0.015)),
                ("exit@+2.0%",    make_fixed_target(0.020)),
                ("exit@+3.0%",    make_fixed_target(0.030)),
            ]

            stops = [
                ("SL1.0%",  stop_fixed(0.010)),
                ("SL1.5%",  stop_fixed(0.015)),
                ("SL2.0%",  stop_fixed(0.020)),
                ("SL2.5%",  stop_fixed(0.025)),
                ("SL_band", stop_below_lower_bb),
                ("SL_wick", stop_below_candle_low),
                ("SL_ATR",  astop),
            ]

            for en, ef in entries:
                for xn, xf in exits:
                    for sn, sf in stops:
                        trades = run_strategy(candles, bbs, ef, xf, sf)
                        s = stats(trades)
                        if s["n"] < args.min_trades:
                            continue
                        results.append({
                            "label":  f"{tag} | {en} | {xn} | {sn}",
                            **s,
                        })

    # ── Sort by expectancy then win-rate ────────────────────────────────────
    results.sort(key=lambda x: (x["exp"], x["wr"]), reverse=True)

    print("\n" + "─" * 100)
    print(f"{'Strategy':<62} {'N':>4} {'WR%':>6} {'AvgW%':>7} {'AvgL%':>7} "
          f"{'R:R':>5} {'Expect%':>8}")
    print("─" * 100)
    for r in results[:25]:
        mark = " ◄" if "bounce_confirm" in r["label"] and "2.0" in r["label"] else ""
        print(f"{r['label']:<62} {r['n']:>4} {r['wr']:>6.1f} {r['aw']:>7.2f} "
              f"{r['al']:>7.2f} {r['rr']:>5.2f} {r['exp']:>8.3f}{mark}")

    # ── Baseline analysis ───────────────────────────────────────────────────
    print("\n" + "─" * 100)
    print("YOUR CURRENT BASELINE:  BB(15,2.0) | bounce_confirm | exit@midBB | SL2.0%")
    bbs_base = calc_bb(candles, 15, 2.0)
    baseline = run_strategy(candles, bbs_base, e_bounce_confirm,
                            exit_mid_bb, stop_fixed(0.02))
    bs = stats(baseline)
    print(f"  Trades: {bs['n']} | WinRate: {bs['wr']:.1f}% | "
          f"AvgWin: {bs['aw']:.2f}% | AvgLoss: {bs['al']:.2f}% | "
          f"R:R: {bs['rr']:.2f} | Expectancy: {bs['exp']:.3f}%/trade | "
          f"Total PnL: {bs['pnl']:.2f}%")

    # ── Loss pattern analysis ───────────────────────────────────────────────
    print("\n" + "─" * 100)
    print("LOSS PATTERN ANALYSIS  (baseline strategy)")
    analyse_losses(baseline, candles, bbs_base)

    # ── Top 3 recommendations ───────────────────────────────────────────────
    print("\n" + "─" * 100)
    print("TOP 3 STRATEGY RECOMMENDATIONS  (by expectancy, ≥8 trades)")
    top3 = [r for r in results if r["n"] >= args.min_trades][:3]
    for i, r in enumerate(top3, 1):
        print(f"\n  #{i}  {r['label']}")
        print(f"       WR: {r['wr']:.1f}% | AvgWin: {r['aw']:.2f}% | "
              f"AvgLoss: {r['al']:.2f}% | R:R: {r['rr']:.2f} | "
              f"Expectancy: {r['exp']:.3f}%/trade")

    # ── Strategy count ──────────────────────────────────────────────────────
    print(f"\n  Tested {len(results)} strategy combinations total.")


if __name__ == "__main__":
    main()
