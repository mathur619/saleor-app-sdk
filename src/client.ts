import { ApolloCache } from "@apollo/client/cache";
import { ApolloClient, ApolloLink } from "@apollo/client";

import { ApolloConfigOptions } from "./types";

/**
 * Creates Apollo client.
 * @param cache Cache used by created Apollo client.
 * @param links Links used by created Apollo client.
 * @param options Rest options, which might be passed to Apollo client.
 */
export function createSaleorClient(
  cache: ApolloCache<any>,
  links: ApolloLink[],
  options?: ApolloConfigOptions
) {
  return new ApolloClient({
    ...options,
    cache,
    link: ApolloLink.from(links),
  });
}
