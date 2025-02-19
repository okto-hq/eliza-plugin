import { Action, elizaLogger, HandlerCallback, IAgentRuntime, Memory, State } from "@elizaos/core";
import { handleApiError, validateSearchQuery } from "../utils.ts";
import { OktoPlugin } from "../index.ts";
import { UserNFTBalance } from "@okto_web3/core-js-sdk/types";

export function getPortfolioNftString(nfts: UserNFTBalance[]): string {
  if (!nfts || nfts.length === 0) {
    return "No NFT portfolio available.";
  }

  let output = "Okto NFT Portfolio\n";
  output += "====================\n\n";

  nfts.forEach((nft, index) => {
    output += `NFT ${index + 1}:\n`;
    output += `  Collection Name           : ${nft.collectionName}\n`;
    output += `  NFT Name                  : ${nft.nftName}\n`;
    output += `  Quantity                  : ${nft.quantity}\n`;
    output += `  Network Name              : ${nft.networkName}\n`;
    output += `  CAIP ID                   : ${nft.caipId}\n`;
    output += `  NFT ID                    : ${nft.nftId}\n`;
    output += `  Token URI                 : ${nft.tokenUri}\n`;
    output += `  Description               : ${nft.description}\n`;
    output += `  Explorer SmartContract URL: ${nft.explorerSmartContractUrl}\n`;
    output += `  Image                     : ${nft.image}\n`;
    output += `  Collection Image          : ${nft.collectionImage}\n`;
    output += "\n";
  });

  return output;
}

export const getPortfolioNftAction = (plugin: OktoPlugin): Action => {
  return {
    name: "OKTO_GET_PORTFOLIO_NFT",
    description: "Get NFT Portfolio",
    examples: [
      [
        { user: "user", content: { text: "get nft portfolio" } },
      ],
      [
        { user: "user", content: { text: "show me my nft portfolio" } },
      ],
      [
        { user: "user", content: { text: "fetch nft portfolio" } },
      ],
    ],
    similes: ["OKTO_GET_PORTFOLIO_NFT", "GET_NFT_PORTFOLIO", "NFT_PORTFOLIO", "FETCH_NFT_PORTFOLIO"],
    suppressInitialMessage: true,
    
    validate: async (
      runtime: IAgentRuntime,
      message: Memory,
      state?: State,
    ) => {
      try {
        validateSearchQuery(message.content);
        return true;
      } catch {
        return false;
      }
    },

    handler: async (
      runtime: IAgentRuntime,
      message: Memory,
      state?: State,
      options?: any,
      callback?: HandlerCallback
    ) => {
      try {
        validateSearchQuery(message.content);

        try {
          const nftPortfolio = await plugin.oktoService.getPortfolioNFT();
          const nftPortfolioString = getPortfolioNftString(nftPortfolio);
          elizaLogger.log("Okto NFT Portfolio: ", nftPortfolioString);

          callback?.(
            {
              text: `✅ Okto NFT Portfolio: \n${nftPortfolioString}`,
            },
            []
          );
        } catch (error) {
          elizaLogger.error("Okto Get NFT Portfolio failed: ", error.message);
          callback?.(
            {
              text: `❌ Okto Get NFT Portfolio failed.`,
            },
            []
          );
        }

        return {
          success: true,
          response: "okto get nft portfolio successful",
        };
      } catch (error) {
        console.log("ERROR: ", error);
        return handleApiError(error);
      }
    },
  }
}