import { gql } from "@apollo/client";

export const pageInfo = gql`
  fragment PageInfo on PageInfo {
    endCursor
    hasNextPage
  }
`;
