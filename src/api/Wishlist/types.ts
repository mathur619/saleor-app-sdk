import { Wishlist_wishlist_items_edges_node_product } from "src/queries/gqlTypes/Wishlist";

export type IWishlistItems =
  | Wishlist_wishlist_items_edges_node_product[]
  | null
  | undefined;
