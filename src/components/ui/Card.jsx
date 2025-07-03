export default function Card({ children, className = "" }) {
  return (
    <div className={`rounded-2xl bg-zinc-900/60 border border-zinc-700 shadow-md backdrop-blur-md ${className}`}>
      {children}
    </div>
  )
}
