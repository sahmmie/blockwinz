import { useCallback, useEffect, useRef } from 'react'

interface DebounceOptions {
  leading?: boolean
  trailing?: boolean
}

export function useDebounce<T extends (...args: unknown[]) => unknown>(
  func: T,
  delay: number,
  options: DebounceOptions = {}
): (...args: Parameters<T>) => void {
  const { leading = false, trailing = true } = options
  const timeoutRef = useRef<NodeJS.Timeout | null>(null)
  const funcRef = useRef(func)
  const argsRef = useRef<Parameters<T> | null>(null)

  useEffect(() => {
    funcRef.current = func
  }, [func])

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }
    }
  }, [])

  return useCallback(
    (...args: Parameters<T>) => {
      argsRef.current = args

      if (!timeoutRef.current && leading) {
        funcRef.current(...args)
      }

      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }

      timeoutRef.current = setTimeout(() => {
        if (trailing && argsRef.current) {
          funcRef.current(...argsRef.current)
        }
        timeoutRef.current = null
      }, delay)
    },
    [delay, leading, trailing]
  )
}
