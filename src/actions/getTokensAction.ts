import { Action, elizaLogger, HandlerCallback, IAgentRuntime, Memory, State } from "@elizaos/core";
import { handleApiError, validateSearchQuery } from "../utils.ts";
import { OktoPlugin } from "../index.ts";
import { Token } from "../types.ts";

export function getTokensString(tokens: Token[]): string {
  if (!tokens || tokens.length === 0) {
    return "No tokens available.";
  }
  
  let output = "Okto Tokens\n";
  output += "============\n\n";
  
  tokens.forEach((token, index) => {
    output += `Token ${index + 1}:\n`;
    output += `  Name        : ${token.name}\n`;
    output += `  Symbol      : ${token.symbol}\n`;
    output += `  Short Name  : ${token.shortName}\n`;
    output += `  Address     : ${token.address}\n`;
    output += `  CAIP ID     : ${token.caipId}\n`;
    output += `  Group ID    : ${token.groupId}\n`;
    output += `  Is Primary  : ${token.isPrimary ? "Yes" : "No"}\n`;
    output += `  CAIP2 ID    : ${token.caip2Id}\n`;
    output += `  Network Name: ${token.networkName}\n`;
    output += `  Onramp    : ${token.isOnrampEnabled ? "Enabled" : "Disabled"}\n`;
    output += `  Image URL   : ${token.image}\n`;
    output += "\n";
  });
  
  return output;
}

export const getTokensAction = (plugin: OktoPlugin): Action => {
  return {
    name: "OKTO_GET_TOKENS",
    description: "Get Tokens",
    examples: [
      [
        { user: "user", content: { text: "get tokens" } },
      ],
      [
        { user: "user", content: { text: "show me my tokens" } },
      ],
      [
        { user: "user", content: { text: "fetch tokens" } },
      ],
    ],
    similes: ["OKTO_GET_TOKENS", "GET_TOKENS", "TOKENS", "FETCH_TOKENS"],
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
          const tokens = await plugin.oktoService.getTokens();
          const tokensString = getTokensString(tokens);
          elizaLogger.log("Okto Tokens: ", tokensString);
          
          callback?.(
            { text: `✅ Okto Tokens: \n${tokensString}` },
            []
          );
        } catch (error) {
          elizaLogger.error("Okto Get Tokens failed: ", error.message);
          callback?.(
            { text: `❌ Okto Get Tokens failed.` },
            []
          );
        }
        
        return {
          success: true,
          response: "okto get tokens successful",
        };
      } catch (error) {
        console.log("ERROR: ", error);
        return handleApiError(error);
      }
    },
  }
}