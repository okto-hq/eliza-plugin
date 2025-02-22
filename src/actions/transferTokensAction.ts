import { Action, composeContext, elizaLogger, generateObject, HandlerCallback, IAgentRuntime, Memory, ModelClass, State } from "@elizaos/core";
import { transferTemplate } from "../templates.ts";
import { z } from "zod";
import { handleApiError, validateSearchQuery } from "../utils.ts";
import { OktoPlugin } from "../index.ts";
import { TokenTransferIntentParams } from "../types.ts";
import { Address } from "@okto_web3/core-js-sdk/types";

export const TransferSchema = z.object({
    caipId: z.string(),
    receivingAddress: z.string(),
    transferAmount: z.number(),
    tokenAddress: z.string(),
});


function isTransferContent(object: any): object is z.infer<typeof TransferSchema> {
    return TransferSchema.safeParse(object).success;
};


export const transferTokensAction = (plugin: OktoPlugin): Action => {
    return {
      name: "OKTO_TRANSFER",
      description: "Perform Token transfers using okto",
      examples: [
        [
          {
            user: "user",
            content: { text: "transfer 1 SOL to winner.sol on solana" },
          },
        ],
        [
          {
            user: "user",
            content: { text: "send 1 eth token to 0x1234567890 on polygon" },
          },
        ],
        [
          {
            user: "user",
            content: { text: "transfer 0.01 POL to 0xF638D541943213D42751F6BFa323ebe6e0fbEaA1 on Polygon amoy testnet" },
          },
        ],
      ],
      similes: ["TRANSFER", "TOKEN_TRANSFER", "OKTO_TRANSFER", "OKTO_SEND", "SEND_TOKEN"],
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
              template: transferTemplate(plugin.oktoService.supportedChains, plugin.oktoService.supportedTokens),
          });

          const transferDetails = await generateObject({
                runtime,
                context,
                modelClass: ModelClass.SMALL,
                schema: TransferSchema,
                mode: "auto"
            });

          const transferObject = transferDetails.object as z.infer<typeof TransferSchema>;
          elizaLogger.info("OKTO Token Transfer Details: ", transferObject)

          if (!isTransferContent(transferDetails.object)) {
                callback?.(
                    {
                        text: "Invalid transfer details. Please check the inputs.",
                    },
                    []
                );
                return;
            }

          try {
            const tokenTransferIntentParams: TokenTransferIntentParams = {
              amount: transferObject.transferAmount,
              recipient: transferObject.receivingAddress as Address,
              token: transferObject.tokenAddress as Address | '',
              caip2Id: transferObject.caipId
            };
            const orderid = await plugin.oktoService.tokenTransfer(tokenTransferIntentParams);

            const resultStr = `✅ Okto Transfer intented submitted.
Submitted transfer of ${tokenTransferIntentParams.amount} ${transferObject.tokenAddress} to ${transferObject.receivingAddress} on ${transferObject.caipId}
Order ID: ${orderid}
`
            elizaLogger.info(resultStr)

            callback?.(
                  {
                    text: resultStr,
                  },
                  []
              );
            } catch (error) {
              elizaLogger.error("Okto Transfer failed: ", error.message)
              callback?.(
                  {
                      text: `❌ Okto Transfer failed.`,
                  },
                  []
              )
            }

            return {
              success: true,
              response: "okto transfer successful",
            };
          } catch (error) {
            console.log("ERROR: ", error)
            return handleApiError(error);
          }
        },
    }
}