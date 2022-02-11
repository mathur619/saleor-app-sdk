import { gql } from "@apollo/client";

export const invoiceFragment = gql`
  fragment InvoiceFragment on Invoice {
    id
    number
    createdAt
    url
    status
  }
`;
