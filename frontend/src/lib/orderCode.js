export function generateOrderCode() {
  const now = new Date()
  const date = now.toISOString().slice(0, 10).replace(/-/g, '')
  const rand = String(Math.floor(Math.random() * 10000)).padStart(4, '0')
  return `ORD-${date}-${rand}`
}
