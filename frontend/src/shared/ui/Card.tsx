import type { CSSProperties, ReactNode } from 'react'

export function Card({ children, className = '', style }: { children: ReactNode; className?: string; style?: CSSProperties }) {
  return <section style={style} className={`fs-panel p-5 transition-all duration-300 ${className}`}>{children}</section>
}
