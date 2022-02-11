import { InMemoryCache, defaultDataIdFromObject } from "@apollo/client";
import {
  AsyncStorageWrapper,
  persistCache as apolloPersistCache,
} from "apollo3-cache-persist";
import AsyncStorage from "@react-native-async-storage/async-storage";

interface SaleorCacheConfig {
  /**
   * Determines if the cache has to be persisted in local storage. False by default.
   */
  persistCache?: boolean;
}

/**
 * Creates cache for Apollo client.
 * @param cacheConfig Configuration for created cache.
 */
export const createSaleorCache = async ({
  persistCache = false,
}: SaleorCacheConfig) => {
  const saleorCache = new InMemoryCache({
    dataIdFromObject: obj => {
      // eslint-disable-next-line no-underscore-dangle
      if (obj.__typename === "Shop") {
        return "shop";
      }
      return defaultDataIdFromObject(obj);
    },
  });

  if (persistCache) {
    await apolloPersistCache({
      cache: saleorCache,
      storage: new AsyncStorageWrapper(AsyncStorage),
    });
  }

  return saleorCache;
};
