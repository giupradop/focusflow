import { useEffect, useRef } from 'react'
import $ from 'jquery'

export function useSlideAnimation(visible: boolean) {
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!ref.current) return
    if (visible) {
      $(ref.current).slideDown(200)
    } else {
      $(ref.current).slideUp(200)
    }
  }, [visible])

  return ref
}