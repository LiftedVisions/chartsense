import { useState, useEffect, useCallback } from "react"
import { FREE_LIMIT, RATE_LIMIT_KEY, RATE_LIMIT_DATE_KEY } from "@/lib/constants"

function todayString(): string {
  return new Date().toISOString().split("T")[0]
}

export function useRateLimit() {
  const [count, setCount] = useState<number>(0)

  useEffect(() => {
    const storedDate = localStorage.getItem(RATE_LIMIT_DATE_KEY)
    const today = todayString()
    if (storedDate !== today) {
      localStorage.setItem(RATE_LIMIT_DATE_KEY, today)
      localStorage.setItem(RATE_LIMIT_KEY, "0")
      setCount(0)
    } else {
      const stored = parseInt(localStorage.getItem(RATE_LIMIT_KEY) ?? "0", 10)
      setCount(isNaN(stored) ? 0 : stored)
    }
  }, [])

  const increment = useCallback(() => {
    setCount(prev => {
      const next = prev + 1
      localStorage.setItem(RATE_LIMIT_KEY, String(next))
      return next
    })
  }, [])

  const reset = useCallback(() => {
    localStorage.setItem(RATE_LIMIT_KEY, "0")
    setCount(0)
  }, [])

  return {
    count,
    remaining: Math.max(0, FREE_LIMIT - count),
    isLimited: count >= FREE_LIMIT,
    increment,
    reset,
  }
}
