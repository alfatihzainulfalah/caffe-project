import { computed, reactive } from 'vue'

const cart = reactive(new Map())

const lines = computed(() => Array.from(cart.values()))
const totalQty = computed(() => lines.value.reduce((sum, line) => sum + line.qty, 0))
const totalPrice = computed(() => lines.value.reduce((sum, line) => sum + line.qty * line.price, 0))

function quantityOf (id) {
  return cart.get(id)?.qty ?? 0
}

function add (menuItem) {
  const existing = cart.get(menuItem.id)
  if (existing) {
    existing.qty++
    return
  }
  cart.set(menuItem.id, {
    id: menuItem.id,
    name: menuItem.name,
    price: menuItem.price,
    qty: 1,
  })
}

function decrease (id) {
  const line = cart.get(id)
  if (!line) return
  if (line.qty <= 1) {
    cart.delete(id)
  } else {
    line.qty--
  }
}

function clear () {
  cart.clear()
}

export function useCart () {
  return { lines, totalQty, totalPrice, quantityOf, add, decrease, clear }
}
