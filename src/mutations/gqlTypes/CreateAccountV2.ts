/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

// ====================================================
// GraphQL mutation operation: ConfirmAccountV2
// ====================================================

export interface ConfirmAccountV2_confirmAccountV2_user_metadata {
    __typename: "MetadataItem";
    /**
     * Key of a metadata item.
     */
    key: string;
    /**
     * Value of a metadata item.
     */
    value: string;
  }
  
  export interface ConfirmAccountV2_confirmAccountV2_user_defaultShippingAddress_country {
    __typename: "CountryDisplay";
    /**
     * Country code.
     */
    code: string;
    /**
     * Country name.
     */
    country: string;
  }
  
  export interface ConfirmAccountV2_confirmAccountV2_user_defaultShippingAddress {
    __typename: "Address";
    /**
     * The ID of the object.
     */
    id: string;
    firstName: string;
    lastName: string;
    companyName: string;
    streetAddress1: string;
    streetAddress2: string;
    city: string;
    postalCode: string;
    /**
     * Shop's default country.
     */
    country: ConfirmAccountV2_confirmAccountV2_user_defaultShippingAddress_country;
    countryArea: string;
    phone: string | null;
    /**
     * Address is user's default billing address.
     */
    isDefaultBillingAddress: boolean | null;
    /**
     * Address is user's default shipping address.
     */
    isDefaultShippingAddress: boolean | null;
  }
  
  export interface ConfirmAccountV2_confirmAccountV2_user_defaultBillingAddress_country {
    __typename: "CountryDisplay";
    /**
     * Country code.
     */
    code: string;
    /**
     * Country name.
     */
    country: string;
  }
  
  export interface ConfirmAccountV2_confirmAccountV2_user_defaultBillingAddress {
    __typename: "Address";
    /**
     * The ID of the object.
     */
    id: string;
    firstName: string;
    lastName: string;
    companyName: string;
    streetAddress1: string;
    streetAddress2: string;
    city: string;
    postalCode: string;
    /**
     * Shop's default country.
     */
    country: ConfirmAccountV2_confirmAccountV2_user_defaultBillingAddress_country;
    countryArea: string;
    phone: string | null;
    /**
     * Address is user's default billing address.
     */
    isDefaultBillingAddress: boolean | null;
    /**
     * Address is user's default shipping address.
     */
    isDefaultShippingAddress: boolean | null;
  }
  
  export interface ConfirmAccountV2_confirmAccountV2_user_addresses_country {
    __typename: "CountryDisplay";
    /**
     * Country code.
     */
    code: string;
    /**
     * Country name.
     */
    country: string;
  }
  
  export interface ConfirmAccountV2_confirmAccountV2_user_addresses {
    __typename: "Address";
    /**
     * The ID of the object.
     */
    id: string;
    firstName: string;
    lastName: string;
    companyName: string;
    streetAddress1: string;
    streetAddress2: string;
    city: string;
    postalCode: string;
    /**
     * Shop's default country.
     */
    country: ConfirmAccountV2_confirmAccountV2_user_addresses_country;
    countryArea: string;
    phone: string | null;
    /**
     * Address is user's default billing address.
     */
    isDefaultBillingAddress: boolean | null;
    /**
     * Address is user's default shipping address.
     */
    isDefaultShippingAddress: boolean | null;
  }
  
  export interface ConfirmAccountV2_confirmAccountV2_user {
    __typename: "User";
    /**
     * The ID of the object.
     */
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    isStaff: boolean;
    /**
     * List of public metadata items. Can be accessed without permissions.
     */
    metadata: (ConfirmAccountV2_confirmAccountV2_user_metadata | null)[];
    defaultShippingAddress: ConfirmAccountV2_confirmAccountV2_user_defaultShippingAddress | null;
    defaultBillingAddress: ConfirmAccountV2_confirmAccountV2_user_defaultBillingAddress | null;
    /**
     * List of all user's addresses.
     */
    addresses: (ConfirmAccountV2_confirmAccountV2_user_addresses | null)[] | null;
  }
  
  export interface ConfirmAccountV2_confirmAccountV2_accountErrors {
    __typename: "AccountError";
    /**
     * Name of a field that caused the error. A value of `null` indicates that the
     * error isn't associated with a particular field.
     */
    field: string | null;
    /**
     * The error message.
     */
    message: string | null;
  }
  
  export interface ConfirmAccountV2_confirmAccountV2_errors {
    __typename: "Error";
    /**
     * Name of a field that caused the error. A value of `null` indicates that the
     * error isn't associated with a particular field.
     */
    field: string | null;
    /**
     * The error message.
     */
    message: string | null;
  }
  
  export interface ConfirmAccountV2_confirmAccountV2 {
    __typename: "ConfirmAccountV2";
    /**
     * JWT token, required to authenticate.
     */
    token: string | null;
    /**
     * JWT refresh token, required to re-generate access token.
     */
    refreshToken: string | null;
    /**
     * CSRF token required to re-generate access token.
     */
    csrfToken: string | null;
    /**
     * An activated user account.
     */
    user: ConfirmAccountV2_confirmAccountV2_user | null;
    accountErrors: ConfirmAccountV2_confirmAccountV2_accountErrors[];
    /**
     * List of errors that occurred executing the mutation.
     */
    errors: ConfirmAccountV2_confirmAccountV2_errors[];
  }
  
  export interface ConfirmAccountV2 {
    /**
     * Confirm user account with otp sent by sms during registration.
     */
    confirmAccountV2: ConfirmAccountV2_confirmAccountV2 | null;
  }
  
  export interface ConfirmAccountV2Variables {
    otp: string;
    phone: string;
  }
  