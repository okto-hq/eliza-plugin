import { GetSupportedNetworksResponseData, Token } from "@okto_web3/core-js-sdk/types";
import { DEFAULT_CHAINS } from "./constants.ts";
import { elizaLogger } from "@elizaos/core";

function getChains(supportedChains: GetSupportedNetworksResponseData[]): string {
  return supportedChains.map(chain => `readonly NetworkName: ${chain.networkName}, CaipId: ${chain.caipId}` ).join("\n\t")
}

function getTokens(supportedTokens: Token[]): string {
  return supportedTokens.map(token =>  `readonly TokenSymbol: ${token.symbol}, CaipId: ${token.caipId}, Address: ${token.address}` ).join("\n\t")
}

export function transferTemplate(supportedChains: GetSupportedNetworksResponseData[], supportedTokens: Token[]) {

  const transferTemplate = `
Extract the following details from the most recent message for processing token transfer using the Okto SDK:
- **receivingAddress** (string): The address to transfer the tokens to.
- **transferAmount** (number): The amount to transfer to the address. This can be a decimal number as well.
- **tokenAddress** (string): The token address to transfer. Note it can be empty string
    static tokens: {
       ${getTokens(supportedTokens)}
    };
- **caipId** (string): The caipId for blockchain network to use. Allowed values are:
    static networks: {
       ${getChains(supportedChains)}
    };

Only Provide the details in the following JSON format, focusing exclusively on the most recent message:

{
    "receivingAddress": "<receiving_address>",
    "transferAmount": <amount>,
    "tokenAddress": "<asset_id>",
    "caipId": "<network>"
}

Here are the recent user messages for context (focus on the last message):
{{recentMessages}}
`;

  elizaLogger.debug(transferTemplate)

  return transferTemplate;
}


export function nftTransferTemplate(supportedChains: GetSupportedNetworksResponseData[]) {

  const nftTransferTemplate = `
Extract the following details from the most recent message for processing NFT transfer using the Okto SDK:
- **recipientWalletAddress** (string): The wallet address to which the NFT should be transferred.
- **nftId** (string): The unique identifier of the NFT.
- **collectionAddress** (string): The contract address of the NFT collection.
- **amount** (number): The quantity of NFTs to transfer (usually 1 for ERC721, but may vary for ERC1155).
- **nftType** (string): Either 'ERC721' or 'ERC1155'.
- **caipId** (string): The caipId for blockchain network to use. Allowed values are:
    static networks: {
       ${getChains(supportedChains)}
    };

Only provide the details in the following JSON format, focusing exclusively on the most recent message:

{
    "recipientWalletAddress": "<recipient_wallet_address>",
    "nftId": "<nft_id>",
    "collectionAddress": "<collection_address>",
    "amount": <amount>,
    "nftType": "<ERC721 or ERC1155>",
    "caip2Id": "<caip2_id>"
}

Here are the recent user messages for context (focus on the last message):
{{recentMessages}}
`;
  elizaLogger.debug(nftTransferTemplate)
  return nftTransferTemplate;
}

export const swapTemplate = `
Extract the following details from the most recent message for processing token swap using the Okto SDK:
- **fromAddress** (string): The wallet address initiating the swap.
- **router** (string): The DEX contract address for executing the swap.
- **tokenIn** (string): The token address you want to swap from.
- **tokenOut** (string): The token address you want to swap to.
- **amountIn** (number): The amount of tokenIn to swap (in smallest unit).
- **minAmountOut** (number): The minimum amount of tokenOut expected (in smallest unit).
- **network** (string): The blockchain network for the transaction. Allowed values are:
    static networks: {
       ${getChains(DEFAULT_CHAINS)}
    };

Only Provide the details in the following JSON format, focusing exclusively on the most recent message:

{
  "fromAddress": "<from_address>",
  "router": "<router_address>",
  "tokenIn": "<token_in_address>",
  "tokenOut": "<token_out_address>",
  "amountIn": <amount_in>,
  "minAmountOut": <min_amount_out>,
  "network": "<network>"
}

Here are the recent user messages for context (focus on the last message):
{{recentMessages}}
`;