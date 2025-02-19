import { Action, elizaLogger, HandlerCallback, IAgentRuntime, Memory, State } from "@elizaos/core";
import { handleApiError, validateSearchQuery } from "../utils.ts";
import { OktoPlugin } from "../index.ts";
import { Order } from "@okto_web3/core-js-sdk/types";

export function getNftCollectionsString(nftCollections: Order[]): string {
  if (!nftCollections || nftCollections.length === 0) {
    return "No NFT Collections available.";
  }
  
  let output = "Okto NFT Collections\n";
  output += "======================\n\n";
  
  nftCollections.forEach((order, index) => {
    output += `Collection ${index + 1}:\n`;
    output += `  Intent ID            : ${order.intentId}\n`;
    output += `  Intent Type          : ${order.intentType}\n`;
    output += `  Status               : ${order.status}\n`;
    output += `  Network Name         : ${order.networkName}\n`;
    output += `  CAIP ID              : ${order.caipId}\n`;
    output += `  Transaction Hashes   : ${order.transactionHash.join(", ")}\n`;
    output += `  Downstream Tx Hashes : ${order.downstreamTransactionHash.join(", ")}\n`;
    output += `  Details              : ${JSON.stringify(order.details, null, 2)}\n`;
    output += "\n";
  });
  
  return output;
}

export const getNftCollectionsAction = (plugin: OktoPlugin): Action => {
    return {
      name: "OKTO_GET_NFT_COLLECTIONS",
      description: "Get NFT Collections",
      examples: [
        [
          {
            user: "user",
            content: { text: "get nft collections" },
          },
        ],
        [
          {
            user: "user",
            content: { text: "show me my nft collections" },
          },
        ],
        [
          {
            user: "user",
            content: { text: "fetch nft collections" },
          },
        ],
      ],
      similes: ["OKTO_GET_NFT_COLLECTIONS", "GET_NFT_COLLECTIONS", "NFT_COLLECTIONS", "FETCH_NFT_COLLECTIONS"],
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
            const nftCollections = await plugin.oktoService.getNftCollections();
            const nftCollectionsString = getNftCollectionsString(nftCollections);
            elizaLogger.log("Okto NFT Collections: ", nftCollectionsString);

            callback?.(
                  {
                    text: `✅ Okto NFT Collections: \n${nftCollectionsString}`,
                  },
                  []
              );
            } catch (error) {
              elizaLogger.error("Okto Get NFT Collections failed: ", error.message)
              callback?.(
                  {
                      text: `❌ Okto Get NFT Collections failed.`,
                  },
                  []
              )
            }

            return {
              success: true,
              response: "okto get nft collections successful",
            };
          } catch (error) {
            console.log("ERROR: ", error)
            return handleApiError(error);
          }
        },
    }
}