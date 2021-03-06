import { InMemoryCache } from "@apollo/client";
import { setupAPI, setupRecording } from "../../../testUtils/api";
import { AuthAPI } from ".";
import { defaultConfig } from "../../config";
import { LocalStorageHandler } from "../../helpers";
import { ApolloClientManager } from "../../data/ApolloClientManager";
import { JobsManager } from "../../jobs";
import { SaleorState } from "../../state";
import APIProxy from "../APIProxy";

setupRecording();

describe("Auth API", () => {
  let authAPI: AuthAPI;
  let cache: InMemoryCache;
  let apiProxy: APIProxy;
  let localStorageHandler: LocalStorageHandler;
  let apolloClientManager: ApolloClientManager;
  let jobsManager: JobsManager;

  beforeAll(async () => {
    const { client, cache: apiCache, apiUrl } = await setupAPI();
    cache = apiCache;

    const config = {
      ...defaultConfig,
      apiUrl,
    };
    localStorageHandler = new LocalStorageHandler();
    apolloClientManager = new ApolloClientManager(client);
    jobsManager = await JobsManager.create(
      localStorageHandler,
      apolloClientManager
    );
    const saleorState = await SaleorState.create(
      config,
      localStorageHandler,
      apolloClientManager,
      jobsManager
    );

    authAPI = await AuthAPI.create(saleorState, jobsManager, config);

    apiProxy = new APIProxy(client);
  });

  it("Returns error if credentials are invalid", async () => {
    const signInResult = await authAPI.signIn("admin@example.com", "admin1");

    expect(signInResult.data).toMatchSnapshot();
    expect(!!signInResult.data?.id).toBe(false);
    expect(signInResult.dataError?.error?.length).toBe(1);
    expect(signInResult.functionError).toBe(undefined);
    expect(signInResult.pending).toBe(false);

    expect(!!authAPI.user?.id).toBe(false);
    expect(authAPI.authenticated).toBe(false);
    expect(authAPI.loaded).toBe(true);
    expect(!!authAPI.token).toBe(false);
  });

  it("Can sign in", async () => {
    const signInResult = await authAPI.signIn("admin@example.com", "admin");

    expect(signInResult.data).toMatchSnapshot();
    expect(!!signInResult.data?.id).toBe(true);
    expect(signInResult.dataError).toBe(undefined);
    expect(signInResult.functionError).toBe(undefined);
    expect(signInResult.pending).toBe(false);

    expect(!!authAPI.user?.id).toBe(true);
    expect(authAPI.authenticated).toBe(true);
    expect(authAPI.loaded).toBe(true);
    expect(!!authAPI.token).toBe(true);
  });

  it("Does not cache mutations", async done => {
    await authAPI
      .signIn("admin@example.com", "admin")
      .then(() =>
        apiProxy.setPassword({
          email: "admin@example.com",
          password: "admin12345678",
          token: "5hr-73a06b70fd6ad8ab3913",
        })
      )
      .catch(() =>
        apiProxy.setPasswordChange({
          newPassword: "admin12345678",
          oldPassword: "admin12345678",
        })
      )
      .catch(() => {
        const extractedCache = cache.extract();
        expect(extractedCache.ROOT_MUTATION).toBeUndefined();

        done();
      });
  });

  it("Can sign out", async () => {
    expect(!!authAPI.user?.id).toBe(true);
    expect(authAPI.authenticated).toBe(true);
    expect(authAPI.loaded).toBe(true);
    expect(!!authAPI.token).toBe(true);

    const signOutResult = await authAPI.signOut();

    expect(signOutResult.pending).toBe(false);

    expect(!!authAPI.user?.id).toBe(false);
    expect(authAPI.authenticated).toBe(false);
    expect(authAPI.loaded).toBe(true);
    expect(!!authAPI.token).toBe(false);
  });
});
