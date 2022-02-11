import { gql } from "@apollo/client";

export const baseCollectionFragment = gql`
  fragment BaseCollection on Collection {
    id
    name
    slug
    seoDescription
    seoTitle
  }
`;

export const collectionFragment = gql`
  ${baseCollectionFragment}
  fragment CollectionDetails on Collection {
    ...BaseCollection
    backgroundImage {
      alt
      url
    }
    description
    descriptionJson
  }
`;
