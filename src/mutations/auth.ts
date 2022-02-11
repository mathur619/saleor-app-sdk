import { gql } from "@apollo/client";
import { userFragment } from "../fragments/auth";

import { accountErrorFragment } from "../fragments/errors";

export const tokenAuthMutation = gql`
  ${accountErrorFragment}
  mutation TokenAuth($email: String!, $password: String!) {
    tokenCreate(email: $email, password: $password) {
      csrfToken
      refreshToken
      token
      errors: accountErrors {
        ...AccountError
      }
      user {
        id
      }
    }
  }
`;

export const tokenVeryficationMutation = gql`
  ${accountErrorFragment}
  mutation VerifyToken($token: String!) {
    tokenVerify(token: $token) {
      isValid
      payload
      user {
        id
      }
      errors: accountErrors {
        ...AccountError
      }
    }
  }
`;

export const tokenRefreshMutation = gql`
  ${accountErrorFragment}
  mutation RefreshToken($csrfToken: String, $refreshToken: String) {
    tokenRefresh(csrfToken: $csrfToken, refreshToken: $refreshToken) {
      token
      user {
        id
      }
      errors: accountErrors {
        ...AccountError
      }
    }
  }
`;

export const createOTPTokeMutation = gql`
  mutation OTPAuthentication($phone: String!, $otp: String!, $checkoutId: ID) {
    CreateTokenOTP: otpTokenCreate(
      otp: $otp
      phone: $phone
      checkoutId: $checkoutId
    ) {
      token
      refreshToken
      csrfToken
      user {
        id
        email
        firstName
        lastName
        metadata {
          key
          value
        }
      }
      otpErrors {
        code
        field
        message
      }
    }
  }
`;

export const CONFIRM_ACCOUNT = gql`
  ${userFragment}
  mutation ConfirmAccountV2($otp: String!, $phone: String!) {
    confirmAccountV2(otp: $otp, phone: $phone) {
      token
      refreshToken
      csrfToken
      user {
        ...User
      }
      accountErrors {
        field
        message
      }
      errors {
        field
        message
      }
    }
  }
`;
