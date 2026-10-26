import { describe, it, expect, beforeEach, vi } from 'vitest';
import {
  getCart,
  clearCart,
  addItemToCart,
  updateItemQuantity,
  updateCartNote,
  calculateLineTotal,
  calculateCartTotal,
} from '../lib/cart';

// Mock localStorage for Vitest node environment
const localStorageMock = (() => {
  let store: Record<string, string> = {};
  return {
    getItem: (key: string) => store[key] || null,
    setItem: (key: string, value: string) => {
      store[key] = value.toString();
    },
    removeItem: (key: string) => {
      delete store[key];
    },
    clear: () => {
      store = {};
    },
  };
})();

Object.defineProperty(global, 'window', {
  value: {
    localStorage: localStorageMock,
  },
  writable: true,
});

Object.defineProperty(global, 'localStorage', {
  value: localStorageMock,
  writable: true,
});

describe('Cart Manager Utilities', () => {
  beforeEach(() => {
    localStorageMock.clear();
  });

  it('calculates line total including options', () => {
    const total = calculateLineTotal(1000, [{ groupName: 'Extras', optionName: 'Cheese', priceDeltaKobo: 200 }], 2);
    expect(total).toBe(2400);
  });

  it('prevents adding items from two different shops without confirmation', () => {
    const shopA = { id: 'shop-1', name: 'Shop A', slug: 'shop-a' };
    const shopB = { id: 'shop-2', name: 'Shop B', slug: 'shop-b' };

    const itemA = { menuItemId: 'item-1', name: 'Rice', unitPriceKobo: 1000 };
    const itemB = { menuItemId: 'item-2', name: 'Burger', unitPriceKobo: 1500 };

    const res1 = addItemToCart(shopA, itemA, 1, []);
    expect(res1.success).toBe(true);

    const res2 = addItemToCart(shopB, itemB, 1, []);
    expect(res2.success).toBe(false);
    expect(res2.requiresClearConfirm).toBe(true);
  });

  it('updates quantity and cart notes correctly', () => {
    const shopA = { id: 'shop-1', name: 'Shop A', slug: 'shop-a' };
    const itemA = { menuItemId: 'item-1', name: 'Rice', unitPriceKobo: 1000 };

    addItemToCart(shopA, itemA, 1, []);
    let cart = getCart();
    expect(cart?.items.length).toBe(1);

    const itemId = cart!.items[0].id;
    updateItemQuantity(itemId, 3);
    cart = getCart();
    expect(cart?.items[0].quantity).toBe(3);
    expect(calculateCartTotal(cart)).toBe(3000);

    updateCartNote('Extra sauce please');
    cart = getCart();
    expect(cart?.note).toBe('Extra sauce please');
  });
});
