import { create } from 'zustand';

export const useCartStore = create((set, get) => ({
  items: JSON.parse(localStorage.getItem('cart')) || [],
  
  addItem: (food) => {
    const items = [...get().items];
    const existingIndex = items.findIndex(item => item.id === food.id);
    
    if (existingIndex >= 0) {
      items[existingIndex].quantity += 1;
    } else {
      items.push({ ...food, quantity: 1 });
    }
    
    localStorage.setItem('cart', JSON.stringify(items));
    set({ items });
  },
  
  removeItem: (foodId) => {
    const items = get().items.filter(item => item.id !== foodId);
    localStorage.setItem('cart', JSON.stringify(items));
    set({ items });
  },
  
  updateQuantity: (foodId, quantity) => {
    if (quantity <= 0) {
      get().removeItem(foodId);
      return;
    }
    
    const items = [...get().items];
    const index = items.findIndex(item => item.id === foodId);
    
    if (index >= 0) {
      items[index].quantity = quantity;
    }
    
    localStorage.setItem('cart', JSON.stringify(items));
    set({ items });
  },
  
  clearCart: () => {
    localStorage.removeItem('cart');
    set({ items: [] });
  },
  
  getTotal: () => {
    return get().items.reduce((total, item) => total + (item.price * item.quantity), 0);
  },
  
  getItemCount: () => {
    return get().items.reduce((count, item) => count + item.quantity, 0);
  },
}));
