import { hookFactory } from "./useHook";

export const useAuth = hookFactory("auth");
export const useCheckout = hookFactory("checkout");
export const useCart = hookFactory("cart");
export const useWishlist = hookFactory("wishlist");