import debounce from 'lodash.debounce'
import { useCallback, useMemo, useState } from 'react'

export function useDebouncedState<T>(initialValue: T, delay: number) {
  const [actualValue, setActualValue] = useState(initialValue)
  const [debouncedValue, setDebouncedValue] = useState(initialValue)
  const [debouncing, setDebouncing] = useState(false)

  const setDebouncedValueDebounced = useMemo(() => {
    return debounce((value: T) => {
      setDebouncedValue(value)
      setDebouncing(false)
    }, delay)
  }, [delay])

  const setValue = useCallback((value: T) => {
    setDebouncedValueDebounced(value)
    setDebouncing(true)
    setActualValue(value)
  }, [setDebouncedValueDebounced])

  const setValueFlushed = useCallback((value: T) => {
    setDebouncedValueDebounced.cancel()
    setDebouncedValueDebounced(value)
    setDebouncing(false)
    setActualValue(value)
  }, [setDebouncedValueDebounced])

  return {
    actualValue,
    debouncedValue,
    setValue,
    setValueFlushed,
    debouncing,
  }
}
