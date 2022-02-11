import { User } from "../../fragments/gqlTypes/User";
import { ErrorListener } from "../../helpers";
import { JobsManager } from "../../jobs";
import { SaleorState, SaleorStateLoaded } from "../../state";
import { StateItems } from "../../state/types";

import { PromiseRunResponse } from "../types";
import { DataErrorAuthTypes } from "./types";
import { Config } from "../../types";

export const BROWSER_NO_CREDENTIAL_API_MESSAGE =
  "Saleor SDK is unable to use browser Credential Management API.";

export class AuthAPI extends ErrorListener {
  /**
   * Indicates if data is initialized, initially retrieved from cache or initially fetched.
   */
  loaded: boolean;

  /**
   * User object with currently signed in user data.
   */
  user?: User | null;

  /**
   * Indicates if user is signed in.
   */
  authenticated?: boolean;

  /**
   * Token used for user authentication.
   */
  token?: string;

  /**
   * Indicate if token refreshing is in progress.
   */
  tokenRefreshing: boolean;

  /**
   * Indicate if token verifying is in progress.
   */
  tokenVerifying: boolean;

  private saleorState: SaleorState;

  private jobsManager: JobsManager;

  private config: Config;

  private constructor(
    saleorState: SaleorState,
    jobsManager: JobsManager,
    config: Config
  ) {
    super();
    this.saleorState = saleorState;
    this.jobsManager = jobsManager;
    this.config = config;

    this.loaded = false;
    this.tokenRefreshing = false;
    this.tokenVerifying = !!this.saleorState.signInToken;

    this.saleorState.subscribeToChange(StateItems.USER, (user: User | null) => {
      this.user = user;
      if (this.loaded) {
        this.authenticated = !!this.user;
      }
    });
    this.saleorState.subscribeToChange(StateItems.SIGN_IN_TOKEN, token => {
      this.token = token;
    });
    this.saleorState.subscribeToChange(
      StateItems.SIGN_IN_TOKEN_REFRESHING,
      tokenRefreshing => {
        this.tokenRefreshing = tokenRefreshing;
      }
    );
    this.saleorState.subscribeToChange(
      StateItems.SIGN_IN_TOKEN_VERIFYING,
      tokenVerifying => {
        this.tokenVerifying = tokenVerifying;
      }
    );
    this.saleorState.subscribeToChange(
      StateItems.LOADED,
      (loaded: SaleorStateLoaded) => {
        this.loaded = loaded.user && loaded.signInToken;
        if (this.loaded) {
          this.authenticated = !!this.user;
        }
      }
    );
    this.saleorState.loadUser();
  }

  static async create(
    saleorState: SaleorState,
    jobsManager: JobsManager,
    config: Config
  ): Promise<AuthAPI> {
    const authApi = new AuthAPI(saleorState, jobsManager, config);

    if (!authApi.saleorState.signInToken) {
      await authApi.autoSignIn();
    }

    return authApi;
  }

  /**
   * Tries to register a user account with given email and password.
   * @param email Email used for new account.
   * @param password Password used for new account.
   * @param redirectUrl URL used for redirection.
   */
  registerAccount = async (
    email: string,
    password: string,
    redirectUrl: string
  ): PromiseRunResponse<DataErrorAuthTypes> => {
    const { data, dataError } = await this.jobsManager.run(
      "auth",
      "registerAccount",
      {
        email,
        password,
        redirectUrl,
      }
    );

    if (dataError?.error) {
      this.fireError(dataError.error, DataErrorAuthTypes.REGISTER_ACCOUNT);
    }

    if (dataError) {
      return {
        data,
        dataError,
        pending: false,
      };
    }

    return {
      data,
      pending: false,
    };
  };

  /**
   * Requests a password reset for an user account with given email.
   * @param email Email used for account.
   * @param redirectUrl URL used for redirection.
   */
  resetPasswordRequest = async (
    email: string,
    redirectUrl: string
  ): PromiseRunResponse<DataErrorAuthTypes> => {
    const { data, dataError } = await this.jobsManager.run(
      "auth",
      "resetPasswordRequest",
      {
        email,
        redirectUrl,
      }
    );

    if (dataError?.error) {
      this.fireError(
        dataError.error,
        DataErrorAuthTypes.RESET_PASSWORD_REQUEST
      );
    }

    if (dataError) {
      return {
        data,
        dataError,
        pending: false,
      };
    }

    return {
      data,
      pending: false,
    };
  };

  signUpMobile = async (
    otp: string,
    phone: string
    // autoSignIn: boolean
  ): PromiseRunResponse<DataErrorAuthTypes> => {
    const { data, dataError } = await this.jobsManager.run(
      "auth",
      "confirmAccountV2",
      {
        otp,
        phone,
      }
    );

    if (dataError) {
      return {
        data,
        dataError,
        pending: false,
      };
    }

    const {
      data: userData,
      dataError: userDataError,
    } = await this.jobsManager.run("auth", "provideUser", undefined);
    if (this.config.loadOnStart.checkout) {
      await this.jobsManager.run("checkout", "provideCheckout", {
        isUserSignedIn: !!data?.user,
      });
    }

    return {
      data: userData,
      dataError: userDataError,
      pending: false,
    };
  };

  /**
   * Tries to authenticate user with given email and password.
   * @param email Email used for authentication.
   * @param password Password used for authentication.
   */
  signIn = async (
    email: string,
    password: string
  ): PromiseRunResponse<DataErrorAuthTypes> => {
    const { data, dataError } = await this.jobsManager.run("auth", "signIn", {
      email,
      password,
    });

    if (dataError) {
      return {
        data,
        dataError,
        pending: false,
      };
    }

    const {
      data: userData,
      dataError: userDataError,
    } = await this.jobsManager.run("auth", "provideUser", undefined);
    if (this.config.loadOnStart.checkout) {
      await this.jobsManager.run("checkout", "provideCheckout", {
        isUserSignedIn: !!data?.user,
      });
    }

    return {
      data: userData,
      dataError: userDataError,
      pending: false,
    };
  };

  signInMobile = async (
    checkoutId: any,
    otp: string,
    phone: string
    // autoSignIn: boolean
  ): PromiseRunResponse<DataErrorAuthTypes> => {
    const { data, dataError } = await this.jobsManager.run(
      "auth",
      "signInMobile",
      {
        checkoutId,
        otp,
        phone,
      }
    );

    if (dataError) {
      return {
        data,
        dataError,
        pending: false,
      };
    }

    const {
      data: userData,
      dataError: userDataError,
    } = await this.jobsManager.run("auth", "provideUser", undefined);
    if (this.config.loadOnStart.checkout) {
      await this.jobsManager.run("checkout", "provideCheckout", {
        isUserSignedIn: !!data?.user,
      });
    }
    // if (this.config.loadOnStart.wishlist) {
    //   await this.jobsManager.run("wishlist", "getWishlist", undefined);
    // }

    return {
      data: userData,
      dataError: userDataError,
      pending: false,
    };
  };

  /**
   * Sign out user by clearing cache, local storage and authentication token.
   */
  signOut = async (): PromiseRunResponse<DataErrorAuthTypes> => {
    await this.jobsManager.run("auth", "signOut", undefined);

    return {
      pending: false,
    };
  };

  /**
   * Tries to refresh user token to keep previously signed in user authenticated.
   * @param refreshToken Refresh token. Required when refreshToken is not provided as a cookie.
   */
  refreshSignInToken = async (
    refreshToken?: string
  ): PromiseRunResponse<DataErrorAuthTypes> => {
    const { data, dataError } = await this.jobsManager.run(
      "auth",
      "refreshSignInToken",
      {
        refreshToken,
      }
    );

    if (dataError) {
      return {
        data,
        dataError,
      };
    }

    return {
      data,
    };
  };

  private autoSignIn = async () => { };

  setUserAvatar = (url: string) => {
    if (this.user) {
      this.user.avatar = {
        url
      };
      this.saleorState.loadUser();
    }
  };

  refreshUserState = () => {
    this.saleorState.loadUser();
  };
}
