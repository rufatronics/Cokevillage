export interface CartOption {
  groupName: string;
  optionName: string;
  priceDeltaKobo: number;
}

export interface CartItem {
  id: string; // unique item instance id in cart
  menuItemId: string;
  name: string;
  unitPriceKobo: number;
  quantity: number;
  selectedOptions: CartOption[];
  lineTotalKobo: number;
}

export interface Cart {
  shopId: string;
  shopName: string;
  shopSlug: string;
  items: CartItem[];
  note: string;
  updatedAt: number;
}

const CART_KEY = 'ck_village_cart';

export function getCart(): Cart | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = localStorage.getItem(CART_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as Cart;
  } catch {
    return null;
  }
}

export function saveCart(cart: Cart | null): void {
  if (typeof window === 'undefined') return;
  if (!cart || cart.items.length === 0) {
    localStorage.removeItem(CART_KEY);
  } else {
    localStorage.setItem(CART_KEY, JSON.stringify(cart));
  }
}

export function clearCart(): void {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(CART_KEY);
}

export function calculateLineTotal(unitPriceKobo: number, selectedOptions: CartOption[], quantity: number): number {
  const optionsTotal = selectedOptions.reduce((acc, opt) => acc + opt.priceDeltaKobo, 0);
  return (unitPriceKobo + optionsTotal) * quantity;
}

export function calculateCartTotal(cart: Cart | null): number {
  if (!cart) return 0;
  return cart.items.reduce((sum, item) => sum + item.lineTotalKobo, 0);
}

export function addItemToCart(
  shop: { id: string; name: string; slug: string },
  item: { menuItemId: string; name: string; unitPriceKobo: number },
  quantity: number,
  selectedOptions: CartOption[]
): { success: boolean; requiresClearConfirm?: boolean } {
  const currentCart = getCart();

  // If cart belongs to another shop, signal confirmation required
  if (currentCart && currentCart.items.length > 0 && currentCart.shopId !== shop.id) {
    return { success: false, requiresClearConfirm: true };
  }

  const lineTotalKobo = calculateLineTotal(item.unitPriceKobo, selectedOptions, quantity);
  const newItem: CartItem = {
    id: `${item.menuItemId}-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
    menuItemId: item.menuItemId,
    name: item.name,
    unitPriceKobo: item.unitPriceKobo,
    quantity,
    selectedOptions,
    lineTotalKobo,
  };

  const nextCart: Cart = currentCart && currentCart.shopId === shop.id
    ? {
        ...currentCart,
        items: [...currentCart.items, newItem],
        updatedAt: Date.now(),
      }
    : {
        shopId: shop.id,
        shopName: shop.name,
        shopSlug: shop.slug,
        items: [newItem],
        note: '',
        updatedAt: Date.now(),
      };

  saveCart(nextCart);
  return { success: true };
}

export function updateItemQuantity(itemId: string, quantity: number): Cart | null {
  const cart = getCart();
  if (!cart) return null;

  if (quantity <= 0) {
    cart.items = cart.items.filter((i) => i.id !== itemId);
  } else {
    cart.items = cart.items.map((item) => {
      if (item.id === itemId) {
        const lineTotalKobo = calculateLineTotal(item.unitPriceKobo, item.selectedOptions, quantity);
        return { ...item, quantity, lineTotalKobo };
      }
      return item;
    });
  }

  saveCart(cart);
  return getCart();
}

export function updateCartNote(note: string): Cart | null {
  const cart = getCart();
  if (!cart) return null;

  cart.note = note.slice(0, 200); // max 200 chars
  saveCart(cart);
  return cart;
}
