import { SaleorState } from "../../state";
import { LocalStorageHandler } from "../../helpers/LocalStorageHandler/LocalStorageHandler";
import { Wishlist_wishlist_items_edges_node_product } from "src/queries/gqlTypes/Wishlist";

export class LocalStorageManager {
  private readonly handler: LocalStorageHandler;

  private saleorState: SaleorState;

  constructor(handler: LocalStorageHandler, saleorState: SaleorState) {
    this.handler = handler;
    this.saleorState = saleorState;
  }

  getHandler = () => {
    return this.handler;
  };

  addItemToCart = async (variantId: string, quantity: number) => {
    const lines = this.saleorState.checkout?.lines || [];
    let variantInCheckout = lines.find(
      variant => variant.variant.id === variantId
    );
    const alteredLines = lines.filter(
      variant => variant.variant.id !== variantId
    );
    const newVariantQuantity = variantInCheckout
      ? variantInCheckout.quantity + quantity
      : quantity;
    if (variantInCheckout) {
      variantInCheckout.quantity = newVariantQuantity;
      alteredLines.push(variantInCheckout);
    } else {
      variantInCheckout = {
        quantity,
        variant: {
          id: variantId,
        },
      };
      alteredLines.push(variantInCheckout);
    }
    const alteredCheckout = this.saleorState.checkout
      ? {
          ...(this.saleorState.checkout?._W? this.saleorState.checkout?._W : this.saleorState.checkout),
          lines: alteredLines,
        }
      : {
          lines: alteredLines,
        };
    await this.handler.setCheckout(alteredCheckout);

    return alteredCheckout;
  };

  removeItemFromCart = async (variantId: string) => {
    const lines = this.saleorState.checkout?.lines || [];
    const variantInCheckout = lines.find(
      variant => variant.variant.id === variantId
    );
    const alteredLines = lines.filter(
      variant => variant.variant.id !== variantId
    );
    if (variantInCheckout) {
      variantInCheckout.quantity = 0;
      alteredLines.push(variantInCheckout);
    }
    const alteredCheckout = this.saleorState.checkout
      ? {
        ...(this.saleorState.checkout?._W? this.saleorState.checkout?._W : this.saleorState.checkout),
        lines: alteredLines,
        }
      : {
          lines: alteredLines,
        };
    await this.handler.setCheckout(alteredCheckout);

    return alteredCheckout;
  };

  subtractItemFromCart = async (variantId: string) => {
    const lines = this.saleorState.checkout?.lines || [];
    const variantFromCart = lines.find(
      variant => variant.variant.id === variantId
    );
    const alteredLines = lines.filter(
      variant => variant.variant.id !== variantId
    );
    const newVariantQuantity = variantFromCart
      ? variantFromCart.quantity - 1
      : 0;
    if (variantFromCart) {
      variantFromCart.quantity = newVariantQuantity;
      alteredLines.push(variantFromCart);
    }
    const alteredCheckout = this.saleorState.checkout
      ? {
        ...(this.saleorState.checkout?._W? this.saleorState.checkout?._W : this.saleorState.checkout),
        lines: alteredLines,
        }
      : {
          lines: alteredLines,
        };
    await this.handler.setCheckout(alteredCheckout);

    return alteredCheckout;
  };

  updateItemInCart = async (variantId: string, quantity: number) => {
    const lines = this.saleorState.checkout?.lines || [];
    const variantInCheckout = lines.find(
      variant => variant.variant.id === variantId
    );
    const alteredLines = lines.filter(
      variant => variant.variant.id !== variantId
    );
    if (variantInCheckout) {
      variantInCheckout.quantity = quantity;
      alteredLines.push(variantInCheckout);
    }
    const alteredCheckout = this.saleorState.checkout
      ? {
        ...(this.saleorState.checkout?._W? this.saleorState.checkout?._W : this.saleorState.checkout),
        lines: alteredLines,
        }
      : {
          lines: alteredLines,
        };
    await this.handler.setCheckout(alteredCheckout);

    return alteredCheckout;
  };

  addItemInWishlist = (
    productList: Wishlist_wishlist_items_edges_node_product[] | null | undefined
  ) => {
    // const items = this.saleorState.wishlist?.items;
    // items?.push(product);
    const wishlist = { items: productList };
    this.handler.setWishlist(wishlist);
  };
}
