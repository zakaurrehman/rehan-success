'use client'
import { useEffect, useRef, useState, type ReactNode, type CSSProperties } from 'react'

/* Scroll-reveal wrapper. Adds `.is-visible` once the element scrolls into view,
   triggering the CSS transition defined on `.reveal`. Respects reduced-motion
   (the CSS forces the visible state). */
export default function Reveal({
  children,
  delay = 0,
  className = '',
  once = true,
  style,
}: {
  children: ReactNode
  delay?: number
  className?: string
  once?: boolean
  style?: CSSProperties
}) {
  const ref = useRef<HTMLDivElement | null>(null)
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true)
          if (once) io.disconnect()
        } else if (!once) {
          setVisible(false)
        }
      },
      { threshold: 0.12, rootMargin: '0px 0px -8% 0px' }
    )
    io.observe(el)
    return () => io.disconnect()
  }, [once])

  return (
    <div
      ref={ref}
      className={`reveal ${visible ? 'is-visible' : ''} ${className}`}
      style={{ transitionDelay: `${delay}ms`, ...style }}
    >
      {children}
    </div>
  )
}
