// It's react-native environment
export const WINDOW_EXISTS = typeof document !== "undefined";

export const LOCAL_STORAGE_EXISTS = WINDOW_EXISTS && !!window.localStorage;
export const CREDENTIAL_API_EXISTS =
  WINDOW_EXISTS && !!window.PasswordCredential;
