import { ApolloLink } from "@apollo/client";
import { BatchHttpLink } from "@apollo/client/link/batch-http";
import { RetryLink } from "@apollo/client/link/retry";
import { extractFiles } from 'extract-files';
import { createUploadLink } from 'apollo-upload-client';
import { authLink, invalidTokenLinkWithTokenHandler } from "./auth";
import { setContext } from "@apollo/client/link/context";

interface SaleorLinksConfig {
  /**
   * Url of the Saleor GraphQL API.
   */
  apiUrl: string;
  /**
   * Callback called when token expiration error occured in Saleor API response.
   */
  tokenExpirationCallback: () => void;
  appversion?: string;
  appplatform?: string;
}

/**
 * Creates list of links for Apollo client.
 * @param linksConfig Configuration for created links.
 */
export const createSaleorLinks = ({
  apiUrl,
  tokenExpirationCallback,
  appplatform,
  appversion
}: SaleorLinksConfig) => {
  const invalidTokenLink = invalidTokenLinkWithTokenHandler(
    tokenExpirationCallback
  );

  const batchAndUploadLink = ApolloLink.split(
    operation => extractFiles(operation).files.size > 0,
    createUploadLink({
      credentials: "include",
      uri: apiUrl,
    }),
    new BatchHttpLink({ credentials: "include", uri: apiUrl })
  );

  const appVersionAndPlatformLink = setContext(async (_, context) => {
    return {
      ...context,
      headers: {
        ...context.headers,
        appVersion: appversion,
        appPlatform: appplatform
      }
    }
  });

  return [
    invalidTokenLink,
    authLink,
    appVersionAndPlatformLink,
    new RetryLink(),
    batchAndUploadLink
  ];
};
