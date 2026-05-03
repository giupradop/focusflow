import { useState, useEffect, useRef } from 'react'

type UseTimerReturn = {
  seconds: number
  isRunning: boolean
  start: () => void
  pause: () => void
  reset: (initialSeconds: number) => void
}

export function useTimer(initialSeconds: number): UseTimerReturn {
  const [seconds, setSeconds] = useState(initialSeconds)
  const [isRunning, setIsRunning] = useState(false)
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)

  useEffect(() => {
    if (isRunning) {
      intervalRef.current = setInterval(() => {
        setSeconds(prev => prev - 1)
      }, 1000)
    } else {
      if (intervalRef.current) clearInterval(intervalRef.current)
    }
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current)
    }
  }, [isRunning])

  function start() { setIsRunning(true) }
  function pause() { setIsRunning(false) }
  function reset(s: number) { setIsRunning(false); setSeconds(s) }

  return { seconds, isRunning, start, pause, reset }
}