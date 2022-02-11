import { ApolloClient } from "@apollo/client";

import { defaultConfig } from "../config";
import { LocalStorageManager } from "../data";
import { ApolloClientManager } from "../data/ApolloClientManager";
import { LocalStorageHandler } from "../helpers/LocalStorageHandler";
import { JobsManager } from "../jobs";
import { SaleorState } from "../state";
import { ConfigInput } from "../types";
import { AuthAPI } from "./Auth";
import APIProxy from "./APIProxy";
import { SaleorCartAPI } from "./Cart";
import { SaleorCheckoutAPI } from "./Checkout";
import { CollectionsAPI } from "./collections/collections";
import { CategoriesAPI } from "./categories/categories";
import { ProductsAPI } from "./products/products";
import { SaleorWishlistAPI } from "./Wishlist";

export * from "./Checkout";
export * from "./Cart";

export class SaleorAPI {
  auth: AuthAPI;

  checkout: SaleorCheckoutAPI;

  cart: SaleorCartAPI;

  wishlist: SaleorWishlistAPI;

  categories: CategoriesAPI;

  collections: CollectionsAPI;

  products: ProductsAPI;

  /**
   * @deprecated Please do not use it anymore. Reference to API Proxy will be removed in future.
   * Now it just exists for legacy React hooks, which also will be removed.
   */
  legacyAPIProxy: APIProxy;

  private constructor(
    auth: AuthAPI,
    checkout: SaleorCheckoutAPI,
    cart: SaleorCartAPI,
    wishlist: SaleorWishlistAPI,
    categories: CategoriesAPI,
    collections: CollectionsAPI,
    products: ProductsAPI,
    legacyAPIProxy: APIProxy
  ) {
    this.auth = auth;
    this.checkout = checkout;
    this.cart = cart;
    this.categories = categories;
    this.collections = collections;
    this.products = products;
    this.wishlist = wishlist;
    this.legacyAPIProxy = legacyAPIProxy;
  }

  static async create(
    client: ApolloClient<any>,
    apiProxy: APIProxy,
    config: ConfigInput,
    onStateUpdate?: () => any
  ): Promise<SaleorAPI> {
    const finalConfig = {
      ...defaultConfig,
      ...config,
      loadOnStart: {
        ...defaultConfig.loadOnStart,
        ...config?.loadOnStart,
      },
    };

    const localStorageHandler = new LocalStorageHandler();
    const apolloClientManager = new ApolloClientManager(client);
    const jobsManager = await JobsManager.create(
      localStorageHandler,
      apolloClientManager
    );
    const saleorState = await SaleorState.create(
      finalConfig,
      localStorageHandler,
      apolloClientManager,
      jobsManager
    );
    const localStorageManager = new LocalStorageManager(
      localStorageHandler,
      saleorState
    );

    if (onStateUpdate) {
      saleorState.subscribeToNotifiedChanges(onStateUpdate);
    }

    const authApi = await AuthAPI.create(saleorState, jobsManager, finalConfig);

    return new SaleorAPI(
      // Create properties with async results
      authApi,
      new SaleorCheckoutAPI(saleorState, jobsManager),
      new SaleorCartAPI(
        localStorageManager,
        apolloClientManager,
        saleorState,
        jobsManager
      ),
      new SaleorWishlistAPI(localStorageManager, apolloClientManager, saleorState, jobsManager),
      new CategoriesAPI(client),
      new CollectionsAPI(client),
      new ProductsAPI(client),
      apiProxy
    );
  }
}
