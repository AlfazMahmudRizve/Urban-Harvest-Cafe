import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

export interface CartItem {
    id: string;
    name: string;
    price: number;
    image: string;
    quantity: number;
}

interface CartState {
    cart: CartItem[];
    scannedTableNumber: string | null;
    addToCart: (item: Omit<CartItem, 'quantity'>) => void;
    removeFromCart: (id: string) => void;
    updateQuantity: (id: string, delta: number) => void;
    clearCart: () => void;
    setScannedTableNumber: (table: string | null) => void;
    getCartTotal: () => number;
    getFinalTotal: () => number;
    isStudentDiscountActive: () => boolean;
}

export const useCartStore = create<CartState>()(
    persist(
        (set, get) => ({
            cart: [],
            scannedTableNumber: null,
            setScannedTableNumber: (table) => set({ scannedTableNumber: table }),
            addToCart: (item) => {
                const currentCart = get().cart;
                const existingItem = currentCart.find((i) => i.id === item.id);

                if (existingItem) {
                    set({
                        cart: currentCart.map((i) =>
                            i.id === item.id ? { ...i, quantity: i.quantity + 1 } : i
                        ),
                    });
                } else {
                    set({ cart: [...currentCart, { ...item, quantity: 1 }] });
                }
            },
            removeFromCart: (id) => {
                set({ cart: get().cart.filter((i) => i.id !== id) });
            },
            updateQuantity: (id, delta) => {
                const currentCart = get().cart;
                const existingItem = currentCart.find((i) => i.id === id);

                if (existingItem) {
                    const newQuantity = existingItem.quantity + delta;
                    if (newQuantity <= 0) {
                        get().removeFromCart(id);
                    } else {
                        set({
                            cart: currentCart.map((i) =>
                                i.id === id ? { ...i, quantity: newQuantity } : i
                            ),
                        });
                    }
                }
            },
            clearCart: () => set({ cart: [] }),
            getCartTotal: () => {
                return get().cart.reduce((total, item) => total + item.price * item.quantity, 0);
            },
            isStudentDiscountActive: () => {
                return get().getCartTotal() >= 1000;
            },
            getFinalTotal: () => {
                const total = get().getCartTotal();
                const discountActive = get().isStudentDiscountActive();
                return discountActive ? total * 0.85 : total;
            },
        }),
        {
            name: 'urban-harvest-cart',
            storage: createJSONStorage(() => localStorage),
            skipHydration: false,
        }
    )
);
