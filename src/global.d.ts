declare interface Window {
  PasswordCredential: any;
  Stripe: any;
  Cypress?: any;
}

declare interface Navigator {
  credentials: any;
}

declare module 'apollo-upload-client';
declare module 'extract-files';
