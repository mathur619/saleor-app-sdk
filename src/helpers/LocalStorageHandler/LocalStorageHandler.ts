import {
  ICheckoutModel,
  IJobsModel,
  IPaymentModel,
  IWishlistModel,
  LocalStorageItems,
} from "./types";
import LocalStorageHandlerProxy from "./Proxy";

export class LocalStorageHandler extends LocalStorageHandlerProxy {
  static async getCheckout(): Promise<ICheckoutModel | null> {
    try {
      return await LocalStorageHandlerProxy.retrieveItem(
        LocalStorageItems.CHECKOUT
      );
    } catch (error) {
      throw new Error(error.message);
    }
  }

  static async getPayment(): Promise<IPaymentModel | null> {
    try {
      return await LocalStorageHandlerProxy.retrieveItem(
        LocalStorageItems.PAYMENT
      );
    } catch (error) {
      throw new Error(error.message);
    }
  }

  static async getJobs(): Promise<IJobsModel | null> {
    try {
      return await LocalStorageHandlerProxy.retrieveItem(
        LocalStorageItems.JOB_QUEUE_CHECKOUT
      );
    } catch (error) {
      throw new Error(error.message);
    }
  }

  static async getSignInToken(): Promise<string | null> {
    try {
      return await LocalStorageHandlerProxy.retrieveItem(
        LocalStorageItems.TOKEN
      );
    } catch (error) {
      throw new Error(error.message);
    }
  }

  static async getCsrfToken(): Promise<string | null> {
    try {
      return await LocalStorageHandlerProxy.retrieveItem(
        LocalStorageItems.CSRF_TOKEN
      );
    } catch (error) {
      throw new Error(error.message);
    }
  }

  static async getRefreshToken(): Promise<string | null> {
    try {
      return await LocalStorageHandlerProxy.retrieveItem(
        LocalStorageItems.REFRESH_TOKEN
      );
    } catch (error) {
      throw new Error(error.message);
    }
  }

  async setSignInToken(token: string | null): Promise<void> {
    try {
      return await this.saveItem(LocalStorageItems.TOKEN, token);
    } catch (error) {
      throw new Error(error.message);
    }
  }

  async setCsrfToken(csrfToken: string | null): Promise<void> {
    try {
      return await this.saveItem(LocalStorageItems.CSRF_TOKEN, csrfToken);
    } catch (error) {
      throw new Error(error.message);
    }
  }

  async setRefreshToken(refreshToken: string | null): Promise<void> {
    try {
      return await this.saveItem(LocalStorageItems.REFRESH_TOKEN, refreshToken);
    } catch (error) {
      throw new Error(error.message);
    }
  }


  async setCheckout(checkout: ICheckoutModel | null): Promise<void> {
    try {
      return await this.saveItem(LocalStorageItems.CHECKOUT, checkout);
    } catch (error) {
      throw new Error(error.message);
    }
  }

  async setPayment(payment: IPaymentModel | null): Promise<void> {
    try {
      return await this.saveItem(LocalStorageItems.PAYMENT, payment);
    } catch (error) {
      throw new Error(error.message);
    }
  }

  async setJobs(jobs: IJobsModel | null): Promise<void> {
    try {
      return await this.saveItem(LocalStorageItems.JOB_QUEUE_CHECKOUT, jobs);
    } catch (error) {
      throw new Error(error.message);
    }
  }

  async setWishlist(wishlist: IWishlistModel | null) {
    try{
      return await this.saveItem(LocalStorageItems.WISHLIST, wishlist);
    } catch (error) {
      throw new Error(error.message);
    }
  }

  async clear(): Promise<void> {
    try {
      return await this.clearStorage();
    } catch (error) {
      throw new Error(error.message);
    }
  }
}
