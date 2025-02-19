import { Action, elizaLogger, HandlerCallback, IAgentRuntime, Memory, State } from "@elizaos/core";
import { handleApiError, validateSearchQuery } from "../utils.ts";
import { OktoPlugin } from "../index.ts";
import { UserPortfolioData } from "@okto_web3/core-js-sdk/types";

export function getPortfolioString(portfolio: UserPortfolioData): string {
    if (!portfolio) {
        return "No portfolio data available.";
    }
    
    let output = "Okto Portfolio\n";
    output += "===============\n\n";
    
    // Aggregated Data
    output += "Aggregated Data:\n";
    output += `  Holdings Count         : ${portfolio.aggregatedData.holdingsCount}\n`;
    output += `  Holdings Price INR     : ${portfolio.aggregatedData.holdingsPriceInr}\n`;
    output += `  Holdings Price USDT    : ${portfolio.aggregatedData.holdingsPriceUsdt}\n`;
    output += `  Total Holding Price INR : ${portfolio.aggregatedData.totalHoldingPriceInr}\n`;
    output += `  Total Holding Price USDT: ${portfolio.aggregatedData.totalHoldingPriceUsdt}\n\n`;
    
    // Group Tokens
    if (portfolio.groupTokens && portfolio.groupTokens.length > 0) {
        output += "Group Tokens:\n";
        portfolio.groupTokens.forEach((group, groupIndex) => {
            output += `\nGroup ${groupIndex + 1}: ${group.name} (${group.symbol})\n`;
            output += `  Group Token Address : ${group.tokenAddress}\n`;
            output += `  Balance             : ${group.balance}\n`;
            output += `  Network             : ${group.networkName}\n`;
            output += `  Sub Tokens:\n`;
            if (group.tokens.length > 0) {
                group.tokens.forEach((token, tokenIndex) => {
                    output += `    ${tokenIndex + 1}. ${token.name} (${token.symbol})\n`;
                    output += `       Address : ${token.tokenAddress}\n`;
                    output += `       Balance : ${token.balance}\n`;
                    output += `       Network : ${token.networkName}\n`;
                });
            } else {
                output += "    No sub tokens available.\n";
            }
        });
    } else {
        output += "No group tokens available.\n";
    }
    
    return output;
}

export const getPortfolioAction = (plugin: OktoPlugin): Action => {
    return {
      name: "OKTO_GET_PORTFOLIO",
      description: "Get Okto Portfolio",
      examples: [
        [
          {
            user: "user",
            content: { text: "get okto portfolio" },
          },
        ],
        [
          {
            user: "user",
            content: { text: "show me my okto portfolio" },
          },
        ],
        [
          {
            user: "user",
            content: { text: "fetch my okto portfolio" },
          },
        ],
      ],
      similes: ["OKTO_GET_PORTFOLIO", "GET_PORTFOLIO", "PORTFOLIO", "FETCH_PORTFOLIO", "FETCH_OKTO_PORTFOLIO"],
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
            const portfolio = await plugin.oktoService.getPortfolio();
            const portfolioString = getPortfolioString(portfolio);
            elizaLogger.log("Okto Portfolio: ", portfolioString)

            callback?.(
                  {
                    text: `✅ Okto Portfolio: \n${portfolioString}`,
                  },
                  []
              );
            } catch (error) {
              elizaLogger.error("Okto Get Portfolio failed: ", error.message)
              callback?.(
                  {
                      text: `❌ Okto Get Portfolio failed.`,
                  },
                  []
              )
            }

            return {
              success: true,
              response: "okto get portfolio successful",
            };
          } catch (error) {
            console.log("ERROR: ", error)
            return handleApiError(error);
          }
        },
    }
}