/**
 * Program IDL in camelCase format in order to be used in JS/TS.
 *
 * Note that this is only a type helper and is not the actual IDL. The original
 * IDL can be found at `target/idl/basketfy.json`.
 */
export type Basketfy = {
  "address": "5PhybSd1vd9RaBjQ8R2cdf5mz2ogemo82RR2gajEGKTg",
  "metadata": {
    "name": "basketfy",
    "version": "0.1.0",
    "spec": "0.1.0",
    "description": "Created with Anchor"
  },
  "instructions": [
    {
      "name": "burnBasketToken",
      "discriminator": [
        215,
        177,
        156,
        113,
        9,
        184,
        69,
        97
      ],
      "accounts": [
        {
          "name": "user",
          "writable": true,
          "signer": true
        },
        {
          "name": "config",
          "writable": true
        },
        {
          "name": "mint",
          "writable": true
        },
        {
          "name": "userTokenAccount",
          "writable": true
        },
        {
          "name": "tokenProgram",
          "address": "TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA"
        }
      ],
      "args": [
        {
          "name": "amount",
          "type": "u64"
        }
      ]
    },
    
    {
      "name": "createBasket",
      "discriminator": [
        47,
        105,
        155,
        148,
        15,
        169,
        202,
        211
      ],
      "accounts": [
        {
          "name": "payer",
          "writable": true,
          "signer": true
        },
        {
          "name": "factory",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  102,
                  97,
                  99,
                  116,
                  111,
                  114,
                  121
                ]
              }
            ]
          }
        },
        {
          "name": "config",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  99,
                  111,
                  110,
                  102,
                  105,
                  103
                ]
              },
              {
                "kind": "account",
                "path": "factory"
              },
              {
                "kind": "account",
                "path": "factory.basket_count",
                "account": "factoryState"
              }
            ]
          }
        },
        {
          "name": "mintAuthority",
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  109,
                  105,
                  110,
                  116,
                  45,
                  97,
                  117,
                  116,
                  104,
                  111,
                  114,
                  105,
                  116,
                  121
                ]
              },
              {
                "kind": "account",
                "path": "config"
              }
            ]
          }
        },
        {
          "name": "metadataAccount",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  109,
                  101,
                  116,
                  97,
                  100,
                  97,
                  116,
                  97
                ]
              },
              {
                "kind": "account",
                "path": "tokenMetadataProgram"
              },
              {
                "kind": "account",
                "path": "mintAccount"
              }
            ],
            "program": {
              "kind": "account",
              "path": "tokenMetadataProgram"
            }
          }
        },
        {
          "name": "mintAccount",
          "writable": true,
          "signer": true
        },
        {
          "name": "tokenMetadataProgram",
          "address": "metaqbxxUerdq28cj1RbAWkYQm3ybzjb6a8bt518x1s"
        },
        {
          "name": "tokenProgram",
          "address": "TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA"
        },
        {
          "name": "systemProgram",
          "address": "11111111111111111111111111111111"
        },
        {
          "name": "rent",
          "address": "SysvarRent111111111111111111111111111111111"
        }
      ],
      "args": [
        {
          "name": "tokenName",
          "type": "string"
        },
        {
          "name": "tokenSymbol",
          "type": "string"
        },
        {
          "name": "tokenUri",
          "type": "string"
        },
        {
          "name": "tokenDecimals",
          "type": "u8"
        },
        {
          "name": "tokenMints",
          "type": {
            "vec": "pubkey"
          }
        },
        {
          "name": "weights",
          "type": {
            "vec": "u64"
          }
        }
      ]
    },
    {
      "name": "initialize",
      "discriminator": [
        175,
        175,
        109,
        31,
        13,
        152,
        155,
        237
      ],
      "accounts": [
        {
          "name": "factory",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  102,
                  97,
                  99,
                  116,
                  111,
                  114,
                  121
                ]
              }
            ]
          }
        },
        {
          "name": "payer",
          "writable": true,
          "signer": true
        },
        {
          "name": "systemProgram",
          "address": "11111111111111111111111111111111"
        }
      ],
      "args": []
    },
    {
      "name": "mintBasketToken",
      "discriminator": [
        190,
        65,
        196,
        32,
        108,
        156,
        87,
        42
      ],
      "accounts": [
        {
          "name": "config",
          "writable": true
        },
        {
          "name": "mintAuthority",
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  109,
                  105,
                  110,
                  116,
                  45,
                  97,
                  117,
                  116,
                  104,
                  111,
                  114,
                  105,
                  116,
                  121
                ]
              },
              {
                "kind": "account",
                "path": "config"
              }
            ]
          }
        },
        {
          "name": "mint",
          "writable": true
        },
        {
          "name": "recipientTokenAccount",
          "writable": true
        },
        {
          "name": "tokenProgram",
          "address": "TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA"
        }
      ],
      "args": [
        {
          "name": "amount",
          "type": "u64"
        }
      ]
    },
    {
      "name": "transferBasketToken",
      "discriminator": [
        235,
        238,
        228,
        29,
        14,
        118,
        217,
        152
      ],
      "accounts": [
        {
          "name": "from",
          "writable": true
        },
        {
          "name": "to",
          "writable": true
        },
        {
          "name": "authority",
          "signer": true
        },
        {
          "name": "mint",
          "writable": true
        },
        {
          "name": "tokenProgram",
          "address": "TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA"
        }
      ],
      "args": [
        {
          "name": "amount",
          "type": "u64"
        }
      ]
    }
  ],
  "accounts": [
    {
      "name": "basketConfig",
      "discriminator": [
        123,
        225,
        246,
        146,
        67,
        165,
        253,
        202
      ]
    },
    {
      "name": "factoryState",
      "discriminator": [
        91,
        157,
        184,
        99,
        123,
        112,
        102,
        7
      ]
    }
  ],
  "events": [
    {
      "name": "basketCreated",
      "discriminator": [
        26,
        146,
        108,
        155,
        189,
        85,
        8,
        7
      ]
    },
    {
      "name": "factoryInitializedEvent",
      "discriminator": [
        242,
        223,
        218,
        189,
        15,
        226,
        221,
        64
      ]
    },
    {
      "name": "tokensBurnedEvent",
      "discriminator": [
        3,
        252,
        127,
        32,
        118,
        230,
        229,
        101
      ]
    },
    {
      "name": "tokensMintedEvent",
      "discriminator": [
        197,
        87,
        251,
        124,
        83,
        45,
        57,
        62
      ]
    },
    {
      "name": "tokensTransferredEvent",
      "discriminator": [
        42,
        30,
        149,
        241,
        219,
        100,
        84,
        199
      ]
    }
  ],
  "errors": [
    {
      "code": 6000,
      "name": "invalidMint",
      "msg": "Invalid mint account - does not match basket config"
    },
    {
      "code": 6001,
      "name": "invalidTokenAccount",
      "msg": "Invalid token account - mint does not match basket"
    },
    {
      "code": 6002,
      "name": "invalidMintAuthority",
      "msg": "Invalid mint authority"
    },
    {
      "code": 6003,
      "name": "tokenWeightMismatch",
      "msg": "Token and weight length mismatch"
    },
    {
      "code": 6004,
      "name": "tooManyTokens",
      "msg": "Too many tokens in basket"
    },
    {
      "code": 6005,
      "name": "nameTooLong",
      "msg": "Name too long"
    },
    {
      "code": 6006,
      "name": "symbolTooLong",
      "msg": "Symbol too long"
    },
    {
      "code": 6007,
      "name": "uriTooLong",
      "msg": "URI too long"
    },
    {
      "code": 6008,
      "name": "weightsSumError",
      "msg": "Weights must sum to exactly 10000"
    },
    {
      "code": 6009,
      "name": "mismatchedArrays",
      "msg": "Mismatched arrays"
    }
  ],
  "types": [
    {
      "name": "basketConfig",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "mint",
            "type": "pubkey"
          },
          {
            "name": "creator",
            "type": "pubkey"
          },
          {
            "name": "name",
            "type": "string"
          },
          {
            "name": "symbol",
            "type": "string"
          },
          {
            "name": "decimals",
            "type": "u8"
          },
          {
            "name": "uri",
            "type": "string"
          },
          {
            "name": "createdAt",
            "type": "i64"
          },
          {
            "name": "tokenMints",
            "type": {
              "vec": "pubkey"
            }
          },
          {
            "name": "weights",
            "type": {
              "vec": "u64"
            }
          }
        ]
      }
    },
    {
      "name": "basketCreated",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "mint",
            "type": "pubkey"
          },
          {
            "name": "creator",
            "type": "pubkey"
          },
          {
            "name": "name",
            "type": "string"
          },
          {
            "name": "symbol",
            "type": "string"
          },
          {
            "name": "uri",
            "type": "string"
          },
          {
            "name": "createdAt",
            "type": "i64"
          },
          {
            "name": "tokenMints",
            "type": {
              "vec": "pubkey"
            }
          },
          {
            "name": "weights",
            "type": {
              "vec": "u64"
            }
          }
        ]
      }
    },
    {
      "name": "factoryInitializedEvent",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "baskets",
            "type": "u64"
          },
          {
            "name": "admin",
            "type": "pubkey"
          },
          {
            "name": "createdAt",
            "type": "i64"
          }
        ]
      }
    },
    {
      "name": "factoryState",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "authority",
            "type": "pubkey"
          },
          {
            "name": "basketCount",
            "type": "u64"
          },
          {
            "name": "bump",
            "type": "u8"
          }
        ]
      }
    },
    {
      "name": "tokensBurnedEvent",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "from",
            "type": "pubkey"
          },
          {
            "name": "amount",
            "type": "u64"
          },
          {
            "name": "owner",
            "type": "pubkey"
          }
        ]
      }
    },
    {
      "name": "tokensMintedEvent",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "mint",
            "type": "pubkey"
          },
          {
            "name": "to",
            "type": "pubkey"
          },
          {
            "name": "amount",
            "type": "u64"
          }
        ]
      }
    },
    {
      "name": "tokensTransferredEvent",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "from",
            "type": "pubkey"
          },
          {
            "name": "to",
            "type": "pubkey"
          },
          {
            "name": "amount",
            "type": "u64"
          }
        ]
      }
    }
  ]
};
