import { gql } from "@apollo/client";

export const attributes = gql`
  query Attributes($id: ID!) {
    attributes(filter: { inCategory: $id }, first: 100) {
      edges {
        node {
          id
          name
          slug
          values {
            id
            name
            slug
          }
        }
      }
    }
  }
`;
