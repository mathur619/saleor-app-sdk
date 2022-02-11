// TODO: implement SecureStorage to store tokens
import { GraphQLError } from "graphql";

import { ApolloLink } from "@apollo/client";
import { setContext } from "@apollo/client/link/context";
import { ErrorResponse, onError } from "@apollo/client/link/error";
import AsyncStorage from "@react-native-async-storage/async-storage";

import { LocalStorageItems } from "./helpers";
import { findValueInEnum } from "./utils";

export enum JWTError {
  invalid = "InvalidTokenError",
  invalidSignature = "InvalidSignatureError",
  expired = "ExpiredSignatureError",
}

export function isJwtError(error: GraphQLError): boolean {
  let jwtError: boolean;

  try {
    jwtError = !!findValueInEnum(error.extensions?.exception.code, JWTError);
  } catch {
    jwtError = false;
  }

  return jwtError;
}

export async function getAuthToken(): Promise<string | null> {
  try {
    return await AsyncStorage.getItem(LocalStorageItems.TOKEN);
  } catch (error) {
    return null;
  }
}

export async function setAuthToken(token: string): Promise<boolean | void> {
  try {
    return await AsyncStorage.setItem(LocalStorageItems.TOKEN, token);
  } catch (error) {
    return false;
  }
}

interface ResponseError extends ErrorResponse {
  networkError?: Error & {
    statusCode?: number;
    bodyText?: string;
  };
}

// possibly remove callback here and use event emitter
export function invalidTokenLinkWithTokenHandler(
  tokenExpirationCallback: () => void
): ApolloLink {
  return onError((error: ResponseError) => {
    const isTokenExpired = error.graphQLErrors?.some(isJwtError);
    if (
      isTokenExpired ||
      (error.networkError && error.networkError.statusCode === 401)
    ) {
      tokenExpirationCallback();
    }
  });
}

export const authLink = setContext(async (_, context) => {
  // get the authentication token from Asyncstorage if it exists
  const authToken = await getAuthToken();
  if (authToken) {
    return {
      ...context,
      // return the headers to the context so httpLink can read them
      headers: {
        ...context.headers,
        authorization: authToken ? `JWT ${JSON.parse(authToken!).item}` : null,
      },
    };
  }

  return context;
});
