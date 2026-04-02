import { create } from 'zustand'

interface CartItem {
  id: string
  nombre: string
  precio: number
  cantidad: number
  notas?: string
  termino?: string
}

interface CartStore {
  items: CartItem[]
  addItem: (item: CartItem) => void
  removeItem: (id: string) => void
  clearCart: () => void
  total: () => number
}

export const useCartStore = create<CartStore>((set, get) => ({
  items: [],
  addItem: (item) => {
    const items = get().items
    const existingItem = items.find((i) => i.id === item.id && i.termino === item.termino)
    if (existingItem) {
      set({
        items: items.map((i) =>
          i.id === item.id && i.termino === item.termino
            ? { ...i, cantidad: i.cantidad + item.cantidad }
            : i
        ),
      })
    } else {
      set({ items: [...items, item] })
    }
  },
  removeItem: (id) => set({ items: get().items.filter((i) => i.id !== id) }),
  clearCart: () => set({ items: [] }),
  total: () => get().items.reduce((acc, item) => acc + item.precio * item.cantidad, 0),
}))
