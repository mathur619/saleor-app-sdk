/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

import { AddressTypes, AddressTypeType } from "./../../gqlTypes/globalTypes";

// ====================================================
// GraphQL mutation operation: UpdateCheckoutAddressType
// ====================================================

export interface UpdateCheckoutAddressType_addressTypeUpdate_addressLink_address {
  __typename: "Address";
  /**
   * The ID of the object.
   */
  id: string;
  firstName: string;
  lastName: string;
  streetAddress1: string;
  streetAddress2: string;
  city: string;
  cityArea: string;
  postalCode: string;
  phone: string | null;
}

export interface UpdateCheckoutAddressType_addressTypeUpdate_addressLink {
  __typename: "AddressLinkType";
  /**
   * The ID of the object.
   */
  id: string;
  address: UpdateCheckoutAddressType_addressTypeUpdate_addressLink_address;
  type: AddressTypeType;
}

export interface UpdateCheckoutAddressType_addressTypeUpdate {
  __typename: "UpdateAddressType";
  /**
   * An address link instance between address and its type.
   */
  addressLink: UpdateCheckoutAddressType_addressTypeUpdate_addressLink | null;
}

export interface UpdateCheckoutAddressType {
  /**
   * Update an address type
   */
  addressTypeUpdate: UpdateCheckoutAddressType_addressTypeUpdate | null;
}

export interface UpdateCheckoutAddressTypeVariables {
  addressId: string;
  type: AddressTypes;
}
