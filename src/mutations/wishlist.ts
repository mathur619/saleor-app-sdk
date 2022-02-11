import gql from "graphql-tag";
export const WishlistAddProduct = gql`
  mutation wishlistAddProduct($productId: ID!) {
    WishlistAddProduct: wishlistAddProduct(productId: $productId) {
      wishlist {
        id
        wishlist {
          id
          createdAt
          items(first: 20) {
            edges {
              node {
                id
                product {
                  id
                  name
                  isPublished
                  slug
                  isAvailableForPurchase
                  metadata {
                    key
                    value
                  }
                  thumbnail {
                    url
                  }
                  images {
                    id
                    alt
                    url
                  }
                  variants {
                    id
                    sku
                    name
                    attributes {
                      attribute {
                        name
                      }
                      values {
                        name
                      }
                    }
                    quantityAvailable(countryCode: IN)
                    images {
                      id
                      url
                      alt
                    }
                    pricing {
                      onSale
                      priceUndiscounted {
                        gross {
                          amount
                          currency
                        }
                        net {
                          amount
                          currency
                        }
                      }
                      price {
                        gross {
                          amount
                          currency
                        }
                        net {
                          amount
                          currency
                        }
                      }
                    }
                  }
                  productType{
                    name
                  }
                  pricing {
                    priceRangeUndiscounted {
                      start {
                        net {
                          amount
                          currency
                        }
                        gross {
                          amount
                          currency
                        }
                      }
                      stop {
                        net {
                          amount
                          currency
                        }
                        gross {
                          amount
                          currency
                        }
                      }
                    }
                    priceRange {
                      start {
                        net {
                          amount
                          currency
                        }
                        gross {
                          amount
                          currency
                        }
                      }
                      stop {
                        net {
                          amount
                          currency
                        }
                        gross {
                          amount
                          currency
                        }
                      }
                    }
                  }
                }
              }
            }
          }
        }
      }
    }
  }
`;
export const WishlistRemoveProduct = gql`
  mutation wishlistRemoveProduct($productId: ID!) {
    WishlistRemoveProduct: wishlistRemoveProduct(productId: $productId) {
      wishlist {
        id
        wishlist {
          id
          createdAt
          items(first: 20) {
            edges {
              node {
                id
                product {
                  id
                  name
                  isPublished
                  slug
                  isAvailableForPurchase
                  metadata {
                    key
                    value
                  }
                  thumbnail {
                    url
                  }
                  images {
                    id
                    alt
                    url
                  }
                  variants {
                    id
                    sku
                    name
                    attributes {
                      attribute {
                        name
                      }
                      values {
                        name
                      }
                    }
                    quantityAvailable(countryCode: IN)
                    images {
                      id
                      url
                      alt
                    }
                    pricing {
                      onSale
                      priceUndiscounted {
                        gross {
                          amount
                          currency
                        }
                        net {
                          amount
                          currency
                        }
                      }
                      price {
                        gross {
                          amount
                          currency
                        }
                        net {
                          amount
                          currency
                        }
                      }
                    }
                  }
                  productType{
                    name
                  }
                  pricing {
                    priceRangeUndiscounted {
                      start {
                        net {
                          amount
                          currency
                        }
                        gross {
                          amount
                          currency
                        }
                      }
                      stop {
                        net {
                          amount
                          currency
                        }
                        gross {
                          amount
                          currency
                        }
                      }
                    }
                    priceRange {
                      start {
                        net {
                          amount
                          currency
                        }
                        gross {
                          amount
                          currency
                        }
                      }
                      stop {
                        net {
                          amount
                          currency
                        }
                        gross {
                          amount
                          currency
                        }
                      }
                    }
                  }
                }
              }
            }
          }
        }
      }
    }
  }
`;
