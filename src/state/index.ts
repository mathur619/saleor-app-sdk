import { round } from "lodash";

import { ApolloClientManager } from "../data/ApolloClientManager";
import { PaymentGateway } from "../fragments/gqlTypes/PaymentGateway";
import { User } from "../fragments/gqlTypes/User";
import { NamedObservable } from "../helpers";
import {
  ICheckoutModel,
  IPaymentModel,
  IWishlistModel,
  LocalStorageEvents,
  LocalStorageHandler,
  LocalStorageItems,
} from "../helpers/LocalStorageHandler";
import { JobsManager } from "../jobs";
import { Config } from "../types";
import { ISaleorStateSummeryPrices, StateItems } from "./types";
import { AuthJobsEvents } from "../jobs/Auth";
import { BROWSER_NO_CREDENTIAL_API_MESSAGE } from "../api/Auth";
import AsyncStorage from "@react-native-async-storage/async-storage";

export interface SaleorStateLoaded {
  user: boolean;
  signInToken: boolean;
  checkout: boolean;
  payment: boolean;
  summaryPrices: boolean;
}

const defaultSaleorStateLoaded = {
  checkout: false,
  payment: false,
  signInToken: false,
  summaryPrices: false,
  user: false,
};

export class SaleorState extends NamedObservable<StateItems> {
  user?: User | null;

  signInToken?: string | null;

  signInTokenRefreshing?: boolean;

  signInTokenVerifying?: boolean;

  checkout?: ICheckoutModel;

  promoCode?: string;

  selectedShippingAddressId?: string;

  selectedBillingAddressId?: string;

  payment?: IPaymentModel | null;

  summaryPrices?: ISaleorStateSummeryPrices;

  // Should be changed it in future to shop object containing payment gateways besides all the shop data
  availablePaymentGateways?: PaymentGateway[] | null;

  loaded: SaleorStateLoaded;

  private apolloClientManager: ApolloClientManager;

  private jobsManager: JobsManager;

  private localStorageHandler: LocalStorageHandler;

  private constructor(
    localStorageHandler: LocalStorageHandler,
    apolloClientManager: ApolloClientManager,
    jobsManager: JobsManager
  ) {
    super();
    this.localStorageHandler = localStorageHandler;
    this.apolloClientManager = apolloClientManager;
    this.jobsManager = jobsManager;

    this.loaded = defaultSaleorStateLoaded;
  }

  static async create(
    config: Config,
    localStorageHandler: LocalStorageHandler,
    apolloClientManager: ApolloClientManager,
    jobsManager: JobsManager
  ): Promise<SaleorState> {
    const saleorState = new SaleorState(
      localStorageHandler,
      apolloClientManager,
      jobsManager
    );
    const signInToken = await LocalStorageHandler.getSignInToken();
    saleorState.onSignInTokenUpdate(signInToken);
    saleorState.subscribeStateToChanges();
    await saleorState.initializeState(config);

    return saleorState;
  }

  /**
   * Subscribes to particular changes occuring in data sources like apollo cache or local storage.
   * Every update in data source will result in update of respective class member.
   */
  private subscribeStateToChanges = () => {
    this.localStorageHandler.subscribeToChange(
      LocalStorageItems.CHECKOUT,
      this.onCheckoutUpdate
    );
    this.localStorageHandler.subscribeToChange(
      LocalStorageItems.PAYMENT,
      this.onPaymentUpdate
    );
    this.localStorageHandler.subscribeToChange(
      LocalStorageItems.TOKEN,
      this.onSignInTokenUpdate
    );
    this.localStorageHandler.subscribeToChange(
      LocalStorageEvents.CLEAR,
      this.onClearLocalStorage
    );
    this.jobsManager.attachEventListener("auth", (event, value) => {
      if (event === AuthJobsEvents.SIGN_IN_TOKEN_REFRESHING) {
        this.onSignInTokenRefreshUpdate(value);
      }
    });
  };

  loadUser = () => {
    this.apolloClientManager.subscribeToUserChange(this.onUserUpdate);
  };

  loadWishlist = () => {
    this.localStorageHandler.subscribeToChange(
      LocalStorageItems.WISHLIST,
      this.onWishlistUpdate
    );
  };

  /**
   * Initialize class members with cached or fetched data.
   */
  private initializeState = async (config: Config) => {
    /**
     * Before making any fetch, first try to verify token if it exists.
     */
    const signInToken = await AsyncStorage.getItem("token");
    const csrfToken = await AsyncStorage.getItem("csrf_token");
    if (signInToken) {
      this.onSignInTokenVerifyingUpdate(true);
      await this.verityToken();
    } else if(csrfToken){
      this.onSignInTokenRefreshUpdate(true);
      await this.refreshToken();
    }
    this.onSignInTokenVerifyingUpdate(false);
    this.onSignInTokenRefreshUpdate(false);
    /**
     * Proceed with state initialization.
     */
    if (config.loadOnStart.auth) {
      await this.jobsManager.run("auth", "provideUser", undefined);
    }
    if (config.loadOnStart.checkout) {
      await this.jobsManager.run("checkout", "provideCheckout", {
        isUserSignedIn: !!this.user,
      });
      const getPayment = await LocalStorageHandler.getPayment();
      this.onPaymentUpdate(getPayment);
    }
  };

  private verityToken = async () => {
    const { data, dataError } = await this.jobsManager.run(
      "auth",
      "verifySignInToken",
      undefined
    );

    if (dataError || !data?.isValid) {
      await this.jobsManager.run("auth", "signOut", undefined);
      try {
        if (navigator.credentials?.preventSilentAccess) {
          await navigator.credentials.preventSilentAccess();
        }
      } catch (credentialsError) {
        // eslint-disable-next-line no-console
        console.warn(BROWSER_NO_CREDENTIAL_API_MESSAGE, credentialsError);
      }
    }
  };

  private refreshToken = async () => {
    const { data, dataError } = await this.jobsManager.run(
      "auth",
      "refreshSignInToken",
      { refreshToken: undefined }
    )
    if (dataError) {
      await this.jobsManager.run("auth", "signOut", undefined);
      try {
        if (navigator.credentials?.preventSilentAccess) {
          await navigator.credentials.preventSilentAccess();
        }
      } catch (credentialsError) {
        // eslint-disable-next-line no-console
        console.warn(BROWSER_NO_CREDENTIAL_API_MESSAGE, credentialsError);
      }
    }
  };

  private onLoadedUpdate = (newLoaded: Partial<SaleorStateLoaded>) => {
    this.loaded = {
      ...this.loaded,
      ...newLoaded,
    };
    this.notifyChange(StateItems.LOADED, this.loaded);
  };

  private onClearLocalStorage = () => {
    this.onSignInTokenUpdate(null);
    this.onUserUpdate(null);
    this.onCheckoutUpdate();
    this.onPaymentUpdate();
  };

  private onSignInTokenUpdate = (token: string | null) => {
    this.signInToken = token;
    this.notifyChange(StateItems.SIGN_IN_TOKEN, this.signInToken);
    this.onLoadedUpdate({
      signInToken: true,
    });
  };

  private onSignInTokenVerifyingUpdate = (tokenVerifying: boolean) => {
    this.signInTokenVerifying = tokenVerifying;
    this.notifyChange(
      StateItems.SIGN_IN_TOKEN_VERIFYING,
      this.signInTokenVerifying
    );
  };

  private onSignInTokenRefreshUpdate = (tokenRefreshing: boolean) => {
    this.signInTokenRefreshing = tokenRefreshing;
    this.notifyChange(
      StateItems.SIGN_IN_TOKEN_REFRESHING,
      this.signInTokenRefreshing
    );
  };

  private onUserUpdate = (user: User | null) => {
    this.user = user;
    this.notifyChange(StateItems.USER, this.user);
    this.onLoadedUpdate({
      user: true,
    });
  };

  private onCheckoutUpdate = (checkout?: ICheckoutModel) => {
    this.checkout = checkout;
    this.summaryPrices = SaleorState.calculateSummaryPrices(checkout);
    this.notifyChange(StateItems.CHECKOUT, this.checkout);
    this.notifyChange(StateItems.SUMMARY_PRICES, this.summaryPrices);
    this.onLoadedUpdate({
      checkout: true,
      summaryPrices: true,
    });
  };

  private onWishlistUpdate = (wishlist?: IWishlistModel) => {
    this.wishlist = wishlist;
    this.notifyChange(StateItems.WISHLIST, this.wishlist);
  };

  private onPaymentUpdate = (payment?: IPaymentModel | null) => {
    this.payment = payment;
    this.notifyChange(StateItems.PAYMENT, this.payment);
    this.onLoadedUpdate({
      payment: true,
    });
  };

  private static calculateSummaryPrices(
    checkout?: ICheckoutModel
  ): ISaleorStateSummeryPrices {
    const items = checkout?.lines;
    const shippingMethod = checkout?.shippingMethod;
    const promoCodeDiscount = checkout?.promoCodeDiscount?.discount;

    if (items && items.length) {
      const firstItemTotalPrice = items[0].totalPrice;

      if (firstItemTotalPrice) {
        const shippingPrice = {
          ...shippingMethod?.price,
          amount: shippingMethod?.price?.amount || 0,
          currency:
            shippingMethod?.price?.currency ||
            firstItemTotalPrice.gross.currency,
        };

        const itemsNetPrice = items.reduce(
          (accumulatorPrice, line) =>
            accumulatorPrice + (line.totalPrice?.net.amount || 0),
          0
        );
        const itemsGrossPrice = items.reduce(
          (accumulatorPrice, line) =>
            accumulatorPrice + (line.totalPrice?.gross?.amount || 0),
          0
        );

        const subtotalPrice = {
          ...firstItemTotalPrice,
          gross: {
            ...firstItemTotalPrice.gross,
            amount: round(itemsGrossPrice, 2),
          },
          net: {
            ...firstItemTotalPrice.net,
            amount: round(itemsNetPrice, 2),
          },
        };

        const discount = {
          ...promoCodeDiscount,
          amount: promoCodeDiscount?.amount || 0,
          currency:
            promoCodeDiscount?.currency || firstItemTotalPrice.gross.currency,
        };

        const totalPrice = {
          ...subtotalPrice,
          gross: {
            ...subtotalPrice.gross,
            amount: round(
              itemsGrossPrice + shippingPrice.amount - discount.amount,
              2
            ),
          },
          net: {
            ...subtotalPrice.net,
            amount: round(
              itemsNetPrice + shippingPrice.amount - discount.amount,
              2
            ),
          },
        };

        return {
          discount,
          shippingPrice,
          subtotalPrice,
          totalPrice,
        };
      }
    }
    return {};
  }
}
