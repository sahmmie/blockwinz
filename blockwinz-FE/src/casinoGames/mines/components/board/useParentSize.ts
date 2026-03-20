import { RefObject, useLayoutEffect, useRef, useState } from 'react'

export interface UseParentSizeResult {
  parentRef: RefObject<HTMLDivElement>
  width: number
  height: number
}

function useParentSize(): UseParentSizeResult {
  const parentRef = useRef<HTMLDivElement>(null)
  const [width, setWidth] = useState(0)
  const [height, setHeight] = useState(0)

  useLayoutEffect(() => {
    const updateSize = () => {
      if (parentRef.current) {
        setWidth(parentRef.current.offsetWidth)
        setHeight(parentRef.current.offsetHeight)
      }
    }

    // Initial size update
    updateSize()

    // Create ResizeObserver to watch for size changes
    const resizeObserver = new ResizeObserver(updateSize)

    if (parentRef.current) {
      resizeObserver.observe(parentRef.current)
    }

    // Cleanup function
    return () => {
      if (parentRef.current) {
        resizeObserver.unobserve(parentRef.current)
      }
    }
  }, [])

  return {
    parentRef,
    width,
    height,
  }
}

export default useParentSize
