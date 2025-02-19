export const NETWORK_TOKEN_ADDRESS = {
  APTOS: {
    APT: "0x1::aptos_coin::AptosCoin",
    USDT: "0xf22bede237a07e121b56d91a491eb7bcdfd1f5907926a9e58338f964a01b17fa::asset::USDT",
  },
  APTOS_TESTNET: {
    APT_TESTNET: "0x1::aptos_coin::AptosCoin",
  },
  AVALANCHE: {
    AVAX: "",
  },
  BSC: {
    BNB: "",
    USDT: "0x55d398326f99059ff775485246999027b3197955",
  },
  LINEA: {
    ETH: "",
  },
  SCROLL: {
    ETH: "",
    USDC: "0x06efdbff2a14a7c8e15944d1f4a48f9f95f663a4",
  },
  BASE: {
    ETH: "",
    USDC: "0x833589fcd6edb6e08f4c7c32d4f71b54bda02913",
    USDT: "0xfde4c96c8593536e31f229ea8f37b2ada2699bb2",
  },
  POLYGON: {
    POL: "",
    USDC: "0x2791bca1f2de4661ed88a30c99a7a9449aa84174",
    USDT: "0xc2132d05d31c914a87c6611c10748aeb04b58e8f",
  },
  POLYGON_TESTNET_AMOY: {
    MATIC: "",
    POL: "",
    USDC: "0x41e94eb019c0762f9bfcf9fb1e58725bfb0e7582",
  },
  SOLANA: {
    SOL: "",
    USDC: "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v",
    USDT: "Es9vMFrzaCERmJfrF4H2FYD4KCoNkY11McCe8BenwNYB",
  },
  SOLANA_DEVNET: {
    SOL_DEVNET: "",
    USDC: "4zMMC9srt5Ri5X14GAgXhaHii3GnPAEERYPJgZJDncDU",
  },
  ZKEVM: {
    QUICK: "0x68286607a1d43602d880d349187c3c48c0fd05e6",
    WETH: "",
  },
  GNOSIS: {
    XDAI: "",
    USDT: "0x4ecaba5870353805a9f068101a40e0f32ed605c6",
  },
  ETHEREUM: {
    WETH: "0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2",
  },
  OPTIMISM: {
    WETH: "",
    USDT: "0x94b008aA00579c1307B0EF2c499aD98a8ce58e58",
  },
  ARBITRUM: {
    WETH: "",
  },
};

export const SUPPORTED_NETWORKS = Object.keys(NETWORK_TOKEN_ADDRESS);
export const SUPPORTED_TOKENS = [
  ...new Set(Object.values(NETWORK_TOKEN_ADDRESS).flatMap(networkTokens => Object.keys(networkTokens))),
];

// Detailed chain information based on provided data.
export const NETWORK_CHAIN_INFO = {
  OPTIMISM: {
    CAIP_ID: "eip155:10",
    CHAIN_ID: 10,
    NETWORK_ID: "f0620691-ce05-3d5c-94c7-1f2cf275c781",
    LOGO: "OP",
    TYPE: "EVM",
    SPONSORSHIP: "Disabled",
    GSN: "Disabled",
  },
  LINEA: {
    CAIP_ID: "eip155:59144",
    CHAIN_ID: 59144,
    NETWORK_ID: "d1d81897-63e0-34fe-9738-c7352baa9fa8",
    LOGO: "LINEA",
    TYPE: "EVM",
    SPONSORSHIP: "Disabled",
    GSN: "Disabled",
  },
  ARBITRUM: {
    CAIP_ID: "eip155:42161",
    CHAIN_ID: 42161,
    NETWORK_ID: "a003a74c-4dd2-3fc7-8c70-c080c9ca5afb",
    LOGO: "ARB",
    TYPE: "EVM",
    SPONSORSHIP: "Disabled",
    GSN: "Disabled",
  },
  APTOS: {
    CAIP_ID: "aptos:mainnet",
    CHAIN_ID: 1,
    NETWORK_ID: "dd50ef5f-58f4-3133-8e25-9c2673a9122f",
    LOGO: "APT",
    TYPE: "APT",
    SPONSORSHIP: "Disabled",
    GSN: "Disabled",
  },
  AVALANCHE: {
    CAIP_ID: "eip155:43114",
    CHAIN_ID: 43114,
    NETWORK_ID: "a3b96c4e-dc81-3c52-a9ee-729974ea74a0",
    LOGO: "AVAX",
    TYPE: "EVM",
    SPONSORSHIP: "Disabled",
    GSN: "Disabled",
  },
  POLYGON: {
    CAIP_ID: "eip155:137",
    CHAIN_ID: 137,
    NETWORK_ID: "ae506585-0ba7-32f3-8b92-120ddf940198",
    LOGO: "POLYGON",
    TYPE: "EVM",
    SPONSORSHIP: "Disabled",
    GSN: "Disabled",
  },
  BASE: {
    CAIP_ID: "eip155:8453",
    CHAIN_ID: 8453,
    NETWORK_ID: "9400de12-efc6-3e69-ab02-0eaf5aaf21e5",
    LOGO: "BASE",
    TYPE: "EVM",
    SPONSORSHIP: "Disabled",
    GSN: "Disabled",
  },
  BSC: {
    CAIP_ID: "eip155:56",
    CHAIN_ID: 56,
    NETWORK_ID: "9a26afcf-ed62-43d8-91ea-42dc7cd55890",
    LOGO: "BSC",
    TYPE: "EVM",
    SPONSORSHIP: "Disabled",
    GSN: "Disabled",
  },
  SOLANA: {
    CAIP_ID: "solana:5eykt4UsFv8P8NJdTREpY1vzqKqZKvdp",
    CHAIN_ID: 101,
    NETWORK_ID: "47465814-da77-3518-84d4-4502fdfce00a",
    LOGO: "SOL",
    TYPE: "SVM",
    SPONSORSHIP: "Disabled",
    GSN: "Disabled",
  },
};

// Mapping from network name to CAIP (cap) ID.
export const NETWORK_TO_CAP_ID = {
  OPTIMISM: "eip155:10",
  LINEA: "eip155:59144",
  ARBITRUM: "eip155:42161",
  APTOS: "aptos:mainnet",
  AVALANCHE: "eip155:43114",
  POLYGON: "eip155:137",
  BASE: "eip155:8453",
  BSC: "eip155:56",
  SOLANA: "solana:5eykt4UsFv8P8NJdTREpY1vzqKqZKvdp",
};