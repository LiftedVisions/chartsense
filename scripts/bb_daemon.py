#!/usr/bin/env python3
"""
Paper-Trading Daemon — BB Baseline vs VWAP+RSI
Exchange : Kraken (CME-routed futures)
Symbols  : MBT (Micro Bitcoin), MET (Micro Ether) — auto front-month
TF       : 5-minute candles
"""

import calendar
import json
import os
import subprocess
import sys
import time
import urllib.request
from datetime import date, datetime, timedelta, timezone
from pathlib import Path

# ── Paths ─────────────────────────────────────────────────────────────────────
SCRIPTS_DIR    = Path(__file__).parent
POSITIONS_FILE = SCRIPTS_DIR / "positions.json"
TRADES_FILE    = SCRIPTS_DIR / "paper_trades.json"

sys.path.insert(0, str(SCRIPTS_DIR))
from btc_bb_backtest import (
    fetch_ohlcv, calc_bb, calc_rsi,
    e_bounce_confirm, exit_mid_bb, stop_fixed,
)

# ── Config ────────────────────────────────────────────────────────────────────
POLL_INTERVAL = 300          # seconds between polls (matches 5-min candle size)
CANDLE_DAYS   = 3            # ~864 candles
MAX_BARS      = 48           # timeout after 4 hours

# BB baseline
BB_PERIOD, BB_STD = 15, 2.0
BB_SL_PCT         = 0.02

# VWAP+RSI primary
VWAP_DEVIATION = 0.005       # close must be ≥0.5% below daily VWAP
RSI_PERIOD     = 14
RSI_ENTRY      = 40          # RSI must be ≤40 (oversold)
VWAP_SL_PCT    = 0.015

PAPER_MODE       = True         # False → live orders via Kraken CLI
EXECUTE_STRATEGY = "vwap_rsi"   # only this strategy sends CLI orders
TRADE_SIZE       = int(os.environ.get("TRADE_SIZE", "1"))
ROLL_DAYS        = 5            # days before expiry to roll to next contract

BOT_TOKEN = os.environ.get("TELEGRAM_BOT_TOKEN", "")
CHAT_ID   = os.environ.get("TELEGRAM_CHAT_ID", "")

# CME month codes (Jan=F … Dec=Z)
_MONTH_CODES = {1:"F",2:"G",3:"H",4:"J",5:"K",6:"M",7:"N",8:"Q",9:"U",10:"V",11:"X",12:"Z"}

# ── CME Contract Helpers ──────────────────────────────────────────────────────

def _last_friday(year: int, month: int) -> date:
    last_day = calendar.monthrange(year, month)[1]
    d = date(year, month, last_day)
    return d - timedelta(days=(d.weekday() - 4) % 7)


def cme_front_month(prefix: str) -> str:
    """Return the current front-month CME symbol (e.g. MBTJ6, METM6).
    Rolls ROLL_DAYS before the last Friday of the expiry month."""
    today = date.today()
    for offset in range(8):
        month = ((today.month - 1 + offset) % 12) + 1
        year  = today.year + (today.month - 1 + offset) // 12
        expiry = _last_friday(year, month)
        if expiry - today >= timedelta(days=ROLL_DAYS):
            return f"{prefix}{_MONTH_CODES[month]}{year % 10}"
    return f"{prefix}Z6"  # unreachable fallback


def active_symbols() -> list[tuple[str, str]]:
    """Return [(data_symbol, trade_symbol)] pairs for BTC and ETH."""
    btc = cme_front_month("MBT")
    eth = cme_front_month("MET")
    # data symbol == trade symbol for CME contracts on Kraken
    return [(btc, btc), (eth, eth)]


# ── Kraken CLI ────────────────────────────────────────────────────────────────

def check_kraken_cli():
    result = subprocess.run(["kraken", "--version"], capture_output=True, text=True)
    if result.returncode != 0:
        print("ERROR: kraken CLI not found. Install from https://github.com/krakenfx/kraken-cli")
        sys.exit(1)


def place_order(symbol: str, side: str) -> dict | None:
    if PAPER_MODE:
        return {"paper": True, "symbol": symbol, "side": side}
    cmd = ["kraken", "futures", "order", side, symbol,
           str(TRADE_SIZE), "--type", "market", "-o", "json"]
    result = subprocess.run(cmd, capture_output=True, text=True, env={**os.environ})
    if result.returncode != 0 or not result.stdout.strip():
        print(f"[ORDER ERROR] {result.stderr.strip()}", file=sys.stderr)
        return None
    return json.loads(result.stdout)


def close_position(symbol: str) -> dict | None:
    return place_order(symbol, "sell")


# ── Telegram ──────────────────────────────────────────────────────────────────

def send_telegram(text: str):
    if not BOT_TOKEN or not CHAT_ID:
        return
    payload = json.dumps({"chat_id": CHAT_ID, "text": text, "parse_mode": "HTML"}).encode()
    try:
        req = urllib.request.Request(
            f"https://api.telegram.org/bot{BOT_TOKEN}/sendMessage",
            data=payload, headers={"Content-Type": "application/json"},
        )
        urllib.request.urlopen(req, timeout=10)
    except Exception as e:
        print(f"[TELEGRAM ERROR] {e}", file=sys.stderr)


# ── VWAP (daily reset at midnight UTC) ───────────────────────────────────────

def calc_vwap(candles: list[dict]) -> list:
    out = [None] * len(candles)
    cum_pv = cum_v = 0.0
    last_day = None
    for i, c in enumerate(candles):
        day = datetime.fromtimestamp(c["t"], tz=timezone.utc).date()
        if day != last_day:
            cum_pv = cum_v = 0.0
            last_day = day
        tp = (c["h"] + c["l"] + c["c"]) / 3
        cum_pv += tp * c["v"]
        cum_v  += c["v"]
        if cum_v > 0:
            out[i] = cum_pv / cum_v
    return out


# ── VWAP+RSI entry / exit ─────────────────────────────────────────────────────

def e_vwap_rsi(i, candles, vwap_vals, rsi_vals):
    v, r = vwap_vals[i], rsi_vals[i]
    if v is None or r is None:
        return None
    if candles[i]["c"] <= v * (1 - VWAP_DEVIATION) and r <= RSI_ENTRY:
        return candles[i]["c"]


def exit_vwap_revert(i, candles, vwap_vals):
    v = vwap_vals[i]
    if v and candles[i]["h"] >= v:
        return v


# ── Position persistence ──────────────────────────────────────────────────────

def default_pos() -> dict:
    return {
        "baseline": {"in_trade": False},
        "vwap_rsi": {"in_trade": False},
    }


def load_positions() -> dict:
    if POSITIONS_FILE.exists():
        try:
            return json.loads(POSITIONS_FILE.read_text())
        except Exception:
            pass
    return {}


def save_positions(positions: dict):
    POSITIONS_FILE.write_text(json.dumps(positions, indent=2))


def append_paper_trade(trade: dict):
    trades: list = []
    if TRADES_FILE.exists():
        try:
            trades = json.loads(TRADES_FILE.read_text())
        except Exception:
            pass
    trades.append(trade)
    TRADES_FILE.write_text(json.dumps(trades, indent=2))


# ── Core strategy logic ───────────────────────────────────────────────────────

def check_symbol(symbol: str, sym_pos: dict) -> dict:
    candles = fetch_ohlcv(symbol, "5m", CANDLE_DAYS)
    if len(candles) < 100:
        print(f"[{symbol}] Only {len(candles)} candles — skipping.")
        return sym_pos

    bbs   = calc_bb(candles, BB_PERIOD, BB_STD)
    rsi14 = calc_rsi(candles, RSI_PERIOD)
    vwap  = calc_vwap(candles)
    i     = len(candles) - 1
    c     = candles[i]
    ts_str = datetime.fromtimestamp(c["t"], tz=timezone.utc).strftime("%Y-%m-%d %H:%M UTC")

    for strategy in ("baseline", "vwap_rsi"):
        pos       = sym_pos.get(strategy, {"in_trade": False})
        executing = (strategy == EXECUTE_STRATEGY)

        if not pos["in_trade"]:
            if strategy == "baseline":
                entry_price = e_bounce_confirm(i, candles, bbs)
                sl_pct      = BB_SL_PCT
            else:
                entry_price = e_vwap_rsi(i, candles, vwap, rsi14)
                sl_pct      = VWAP_SL_PCT

            if entry_price is not None:
                stop_price = stop_fixed(sl_pct)(i, candles, bbs, entry_price)
                pos = {
                    "in_trade":    True,
                    "entry_price": entry_price,
                    "stop_price":  stop_price,
                    "entry_ts":    c["t"],
                }
                if strategy == "vwap_rsi" and vwap[i]:
                    pos["vwap_at_entry"] = vwap[i]
                sym_pos[strategy] = pos

                order_result = None
                if executing:
                    order_result = place_order(symbol, "buy")

                if executing:
                    extras = ""
                    if strategy == "vwap_rsi" and vwap[i] and rsi14[i]:
                        dev = (entry_price - vwap[i]) / vwap[i] * 100
                        extras = (f"\nVWAP: {vwap[i]:,.2f}  |  "
                                  f"RSI({RSI_PERIOD}): {rsi14[i]:.1f}  |  "
                                  f"Dev: {dev:.2f}%")
                    mode_tag = "ORDER PLACED" if not PAPER_MODE else "PAPER"
                    send_telegram(
                        f"<b>ENTRY [{strategy}] ✦ {mode_tag}</b>\n"
                        f"{symbol}  Size: {TRADE_SIZE}\n"
                        f"Price: {entry_price:,.2f}  |  Stop: {stop_price:,.2f} (-{sl_pct*100:.1f}%)"
                        f"{extras}\n{ts_str}"
                    )
                else:
                    send_telegram(
                        f"<b>ENTRY [{strategy}] (internal only)</b>\n"
                        f"{symbol}\n"
                        f"Price: {entry_price:,.2f}  |  Stop: {stop_price:,.2f}\n{ts_str}"
                    )
                print(f"[{symbol}][{strategy}] ENTRY  "
                      f"price={entry_price:,.2f}  stop={stop_price:,.2f}")

        else:
            entry_price = pos["entry_price"]
            stop_price  = pos["stop_price"]
            bars_held   = (c["t"] - pos["entry_ts"]) // 300   # 5-min candles
            exit_price  = None
            exit_reason = None

            if c["l"] <= stop_price:
                exit_price  = min(c["o"], stop_price)
                exit_reason = "stop"
            elif bars_held >= MAX_BARS:
                exit_price  = c["c"]
                exit_reason = "timeout"
            else:
                if strategy == "baseline":
                    ep2 = exit_mid_bb(i, candles, bbs, entry_price)
                else:
                    ep2 = exit_vwap_revert(i, candles, vwap)
                if ep2 is not None:
                    exit_price  = ep2
                    exit_reason = "target"

            if exit_price is not None:
                pnl = (exit_price - entry_price) / entry_price * 100
                win = pnl > 0
                append_paper_trade({
                    "strategy":     strategy,
                    "symbol":       symbol,
                    "entry_ts":     pos["entry_ts"],
                    "exit_ts":      c["t"],
                    "entry_price":  entry_price,
                    "exit_price":   exit_price,
                    "stop_price":   stop_price,
                    "pnl_pct":      round(pnl, 4),
                    "win":          win,
                    "exit_reason":  exit_reason,
                    "candles_held": bars_held,
                    "kraken_order": executing and not PAPER_MODE,
                    "logged_at":    datetime.now(tz=timezone.utc).isoformat(),
                })
                sym_pos[strategy] = {"in_trade": False}

                if executing:
                    close_position(symbol)
                    label = "✓ WIN" if win else "✗ LOSS"
                    send_telegram(
                        f"<b>EXIT {label} [{strategy}]</b>\n"
                        f"{symbol}  Entry: {entry_price:,.2f} → Exit: {exit_price:,.2f}\n"
                        f"PnL: {pnl:+.2f}%  |  Reason: {exit_reason}  |  Held: {bars_held} candles"
                    )
                print(f"[{symbol}][{strategy}] EXIT  "
                      f"{exit_reason}  pnl={pnl:+.2f}%  bars={bars_held}")

    return sym_pos


# ── Main loop ─────────────────────────────────────────────────────────────────

def main():
    if not PAPER_MODE:
        check_kraken_cli()

    symbols = active_symbols()
    syms_str = ", ".join(s for s, _ in symbols)
    mode_str = "paper" if PAPER_MODE else "LIVE"

    print(f"[DAEMON] started  symbols={syms_str}  mode={mode_str}  execute={EXECUTE_STRATEGY}")
    send_telegram(
        f"<b>BB Daemon started</b>\n"
        f"Symbols: {syms_str}\n"
        f"Strategies: baseline (BB bounce) + vwap_rsi (primary)\n"
        f"Active orders: {EXECUTE_STRATEGY}  |  Mode: {mode_str}\n"
        f"Poll: every {POLL_INTERVAL}s"
    )

    while True:
        # Refresh front-month symbols each cycle in case of contract roll
        symbols = active_symbols()
        positions = load_positions()

        for sym, trade_sym in symbols:
            sym_pos = positions.get(sym, default_pos())
            try:
                positions[sym] = check_symbol(sym, sym_pos)
            except Exception as e:
                print(f"[{sym}] ERROR: {e}", file=sys.stderr)

        save_positions(positions)
        print(f"[DAEMON] cycle done — sleeping {POLL_INTERVAL}s …")
        time.sleep(POLL_INTERVAL)


if __name__ == "__main__":
    main()
