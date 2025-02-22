import { Action, composeContext, elizaLogger, generateObject, HandlerCallback, IAgentRuntime, Memory, ModelClass, State } from "@elizaos/core";
import { nftTransferTemplate } from "../templates.ts";
import { z } from "zod";
import { handleApiError, validateSearchQuery } from "../utils.ts";
import { OktoPlugin } from "../index.ts";
import { NFTTransferIntentParams } from "../types.ts";
import { Address } from "@okto_web3/core-js-sdk/types";

export const NFTTransferSchema = z.object({
    caip2Id: z.string(),
    recipientWalletAddress: z.string(),
    nftId: z.string(),
    collectionAddress: z.string(),
    amount: z.number(),
    nftType: z.enum(["ERC721", "ERC1155"]),
});

function isNFTTransferContent(object: any): object is z.infer<typeof NFTTransferSchema> {
    return NFTTransferSchema.safeParse(object).success;
};

export const nftTransferAction = (plugin: OktoPlugin): Action => {
    return {
      name: "OKTO_NFT_TRANSFER",
      description: "Perform NFT transfers using okto",
      examples: [
        [
          {
            user: "user",
            content: { 
              text: "transfer NFT ART001 from collection 0xABCDEFABCDEF to wallet 0x1234567890, amount 1, ERC721 on network eip155:1" 
            },
          },
        ],
        [
          {
            user: "user",
            content: { 
              text: "send NFT COLLECTIBLE42 from collection 0x9876543210ABCDEF to wallet 0xABCDEF123456, amount 1, ERC1155 on network eip155:137" 
            },
          },
        ],
        [
          {
            user: "user",
            content: { 
              text: "transfer NFT ASSET007 from collection 0x111222333444 to wallet 0xWINNER001, amount 1, ERC721 on network eip155:1" 
            },
          },
        ],
      ],
      similes: ["NFT_TRANSFER", "TOKEN_NFT_TRANSFER", "OKTO_NFT_TRANSFER", "SEND_NFT"],
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

          if (!state) {
              state = (await runtime.composeState(message)) as State;
          } else {
              state = await runtime.updateRecentMessageState(state);
          }

          const context = composeContext({
              state,
              template: nftTransferTemplate(plugin.oktoService.supportedChains),
          });

          const transferDetails = await generateObject({
                runtime,
                context,
                modelClass: ModelClass.SMALL,
                schema: NFTTransferSchema,
                mode: "auto"
            });

          const transferObject = transferDetails.object as z.infer<typeof NFTTransferSchema>;
          elizaLogger.info("OKTO NFT Transfer Details: ", transferObject);

          const data = {
            caip2Id: transferObject.caip2Id,
            recipientWalletAddress: transferObject.recipientWalletAddress,
            nftId: transferObject.nftId,
            collectionAddress: transferObject.collectionAddress,
            amount: transferObject.amount,
            nftType: transferObject.nftType,
          };

          if (!isNFTTransferContent(transferDetails.object)) {
                callback?.(
                    {
                        text: "Invalid NFT transfer details. Please check the inputs.",
                    },
                    []
                );
                return;
          }

          // NFT transfers don't have a quantity—the NFT asset itself is unique.
          // If needed, you may include a line to get a transaction hash from okto.

          try {
            const nftTransferIntentParams: NFTTransferIntentParams = {
              caip2Id: data.caip2Id,
              collectionAddress: data.collectionAddress as Address,
              nftId: data.nftId,
              recipientWalletAddress: data.recipientWalletAddress as Address,
              amount: data.amount,
              nftType: data.nftType,
            };
            // Call the NFT transfer method on the Okto plugin
            const orderid = await plugin.oktoService.nftTransfer(nftTransferIntentParams);

            const resultStr = `✅ Okto NFT Transfer intent submitted.
Submitted NFT ${data.nftId} transfer from collection ${data.collectionAddress} to ${data.recipientWalletAddress} on network ${data.caip2Id}
Order ID: ${orderid}
`;
            elizaLogger.info(resultStr);

            callback?.(
                  {
                    text: resultStr,
                  },
                  []
              );
            } catch (error) {
              elizaLogger.error("Okto NFT Transfer failed: ", error.message);
              callback?.(
                  {
                      text: `❌ Okto NFT Transfer failed.`,
                  },
                  []
              );
            }

            return {
              success: true,
              response: "okto nft transfer successful",
            };
          } catch (error) {
            console.log("ERROR: ", error);
            return handleApiError(error);
          }
        },
    }
}