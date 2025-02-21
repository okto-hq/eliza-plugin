import { Action, composeContext, elizaLogger, generateObject, HandlerCallback, IAgentRuntime, Memory, ModelClass, State } from "@elizaos/core";
import { swapTemplate } from "../templates.ts";
import { z } from "zod";
import { handleApiError, validateSearchQuery } from "../utils.ts";
import { OktoPlugin } from "../index.ts";

export const SwapSchema = z.object({
    network: z.string().toUpperCase(),
    fromAddress: z.string(),
    router: z.string(),
    tokenIn: z.string(),
    tokenOut: z.string(),
    amountIn: z.number(),
    minAmountOut: z.number()
});

function isSwapContent(object: any): object is z.infer<typeof SwapSchema> {
    return SwapSchema.safeParse(object).success;
};

export const swapTokensAction = (plugin: OktoPlugin): Action => {
    return {
      name: "OKTO_SWAP",
      description: "Perform token swap using Okto",
      examples: [
        [
          {
            user: "user",
            content: { text: "swap 1 ETH for 200 DAI using Uniswap on Ethereum" },
          },
        ],
        [
          {
            user: "user",
            content: { text: "swap 0.5 SOL for 100 USDC on Solana via Serum" },
          },
        ],
      ],
      similes: ["SWAP", "TOKEN_SWAP", "OKTO_SWAP"],
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
              template: swapTemplate,
          });

          const swapDetailsResult = await generateObject({
                runtime,
                context,
                modelClass: ModelClass.SMALL,
                schema: SwapSchema,
                mode: "auto"
          });

          if (!isSwapContent(swapDetailsResult.object)) {
                callback?.(
                    {
                        text: "Invalid swap details. Please check the inputs.",
                    },
                    []
                );
                return;
          }

          const swapDetails = swapDetailsResult.object as z.infer<typeof SwapSchema>;
          elizaLogger.info("OKTO Swap Details: ", swapDetails);

          
          const tokenSwapIntentParams = {
              isNative: true,
              amountIn: swapDetails.amountIn,
              minAmountOut: swapDetails.minAmountOut,
              from: swapDetails.fromAddress,
              router: swapDetails.router,
              tokenIn: swapDetails.tokenIn,
              tokenOut: swapDetails.tokenOut,
              chain: ""
          };

          const orderid = await plugin.oktoService.tokenSwap(tokenSwapIntentParams);

          const resultStr = `✅ Okto Swap intent submitted.
Swapping ${swapDetails.amountIn} of Token: ${swapDetails.tokenIn} for a minimum of ${swapDetails.minAmountOut} of Token: ${swapDetails.tokenOut} 
on network ${swapDetails.network}
Order ID: ${orderid}
`
          elizaLogger.info(resultStr);

          callback?.(
                {
                  text: resultStr,
                },
                []
          );

          return {
            success: true,
            response: "okto swap successful",
          };
          
        } catch (error) {
          console.log("ERROR: ", error);
          return handleApiError(error);
        }
      },
    }
}