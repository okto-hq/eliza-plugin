import { Action, elizaLogger, HandlerCallback, IAgentRuntime, Memory, State } from "@elizaos/core";
import { handleApiError, validateSearchQuery } from "../utils.ts";
import { OktoPlugin } from "../index.ts";
import { Wallet } from "../types.ts";

export function getAccountString(account: Wallet[]): string {
    if (!account) {
        return "No account data available.";
    }
    
    let output = "Okto Account\n";
    output += "===============\n\n";
    
    // Aggregated Data Section based on account data
    output += "Aggregated Data:\n";
    output += `  Wallet Count : ${account.length}\n\n`;

    // Wallets Section
    if (account.length > 0) {
        output += "Wallets:\n";
        account.forEach((wallet, index) => {
            output += `\nWallet ${index + 1}:\n`;
            output += `  CAIP ID      : ${wallet.caipId}\n`;
            output += `  Network Name : ${wallet.networkName}\n`;
            output += `  Address      : ${wallet.address}\n`;
            output += `  CAIP2 ID     : ${wallet.caip2Id}\n`;
            output += `  Network Sym. : ${wallet.networkSymbol}\n`;
        });
    } else {
        output += "No wallets available.\n";
    }

    return output;
}

export const getAccountAction = (plugin: OktoPlugin): Action => {
    return {
      name: "OKTO_GET_ACCOUNT",
      description: "Get Okto Account",
      examples: [
        [
          {
            user: "user",
            content: { text: "get okto account" },
          },
        ],
        [
          {
            user: "user",
            content: { text: "show me my okto account" },
          },
        ],
        [
          {
            user: "user",
            content: { text: "fetch my okto account" },
          },
        ],
      ],
      similes: ["OKTO_GET_ACCOUNT", "GET_ACCOUNT", "ACCOUNT", "FETCH_ACCOUNT"],
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
            const account = await plugin.oktoService.getAccount();
            const accountString = getAccountString(account);
            elizaLogger.log("Okto Account: ", accountString);

            callback?.(
                  {
                    text: `✅ Okto Account: \n${accountString}`,
                  },
                  []
              );
            } catch (error) {
              elizaLogger.error("Okto Get Account failed: ", error.message)
              callback?.(
                  {
                      text: `❌ Okto Get Account failed.`,
                  },
                  []
              )
            }

            return {
              success: true,
              response: "okto get account successful",
            };
          } catch (error) {
            console.log("ERROR: ", error)
            return handleApiError(error);
          }
        },
    }
}