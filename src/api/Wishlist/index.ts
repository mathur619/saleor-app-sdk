import { LocalStorageManager } from "../../data";
import { ErrorListener } from "../../helpers";
import { IWishlistModel } from "../../helpers/LocalStorageHandler";
import { JobsManager } from "../../jobs";
import { SaleorState, SaleorStateLoaded } from "../../state";
import { StateItems } from "../../state/types";
import { ApolloClientManager } from "../../data/ApolloClientManager";

import { IWishlistItems } from "./types";

export class SaleorWishlistAPI extends ErrorListener {
  loaded: boolean;

  items: IWishlistItems;

  private apolloClientManager: ApolloClientManager;

  private jobsManager: JobsManager;

  private localStorageManager: LocalStorageManager;

  private saleorState: SaleorState;

  constructor(
    localStorageManager: LocalStorageManager,
    apolloClientManager: ApolloClientManager,
    saleorState: SaleorState,
    jobsManager: JobsManager
  ) {
    super();
    this.saleorState = saleorState;
    this.localStorageManager = localStorageManager;
    this.apolloClientManager = apolloClientManager;
    this.jobsManager = jobsManager;

    this.loaded = false;

    this.jobsManager.attachErrorListener("cart", this.fireError);

    this.saleorState.subscribeToChange(
      StateItems.WISHLIST,
      (wishlist: IWishlistModel) => {
        this.items = wishlist?.items;
      }
    );

    this.saleorState.subscribeToChange(
      StateItems.LOADED,
      (loaded: SaleorStateLoaded) => {
        this.loaded = loaded.checkout && loaded.summaryPrices;
      }
    );

    this.saleorState.loadWishlist();
  }
  
  getWishlist = async () => {
    const { data, dataError } = await this.jobsManager.run(
      "wishlist",
      "getWishlist",
      undefined
    );
    return {
      data,
      dataError,
    };
  };

  addItemInWishlist = async (productId: string) => {
    const { data, dataError } = await this.jobsManager.run(
      "wishlist",
      "addItemInWishlist",
      { productId }
    );

    return {
      data,
      dataError,
    };
  };

  removeItemInWishlist = async (productId: string) => {
    // 1. save in local storage

    // 2. save online if possible (if checkout id available)
    const { data } = await this.apolloClientManager.removeWishlistItems(
      productId
    );

    this.localStorageManager.addItemInWishlist(
      data ? data[0]?.wishlist.items.edges.map(edge => edge.node.product) : []
    );
  };
}
