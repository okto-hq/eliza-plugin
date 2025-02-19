import { Action, elizaLogger, HandlerCallback, IAgentRuntime, Memory, State } from "@elizaos/core";
import { handleApiError, validateSearchQuery } from "../utils.ts";
import { OktoPlugin } from "../index.ts";
import { GetSupportedNetworksResponseData } from "@okto_web3/core-js-sdk/types";

export function getChainsString(chains: GetSupportedNetworksResponseData[]): string {
  if (!chains || chains.length === 0) {
    return "No chain data available.";
  }
  
  let output = "Okto Supported Chains\n";
  output += "======================\n\n";
  
  chains.forEach((chain, index) => {
    output += `Chain ${index + 1}:\n`;
    output += `  CAIP ID         : ${chain.caipId}\n`;
    output += `  Network Name    : ${chain.networkName}\n`;
    output += `  Chain ID        : ${chain.chainId}\n`;
    output += `  Network ID      : ${chain.networkId}\n`;
    output += `  Logo            : ${chain.logo}\n`;
    output += `  Type            : ${chain.type}\n`;
    output += `  Sponsorship     : ${chain.sponsorshipEnabled ? 'Enabled' : 'Disabled'}\n`;
    output += `  GSN             : ${chain.gsnEnabled ? 'Enabled' : 'Disabled'}\n`;
    output += "\n";
  });
  
  return output;
}

export const getChainAction = (plugin: OktoPlugin): Action => {
  return {
    name: "OKTO_GET_CHAINS",
    description: "Get Supported Chains",
    examples: [
      [
        { user: "user", content: { text: "get supported chains" } },
      ],
      [
        { user: "user", content: { text: "show me supported chains" } },
      ],
      [
        { user: "user", content: { text: "fetch supported chains" } },
      ],
    ],
    similes: ["OKTO_GET_CHAINS", "GET_CHAINS", "SUPPORTED_CHAINS", "CHAINS"],
    suppressInitialMessage: true,
    
    validate: async (runtime: IAgentRuntime, message: Memory, state?: State) => {
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
          const chains = await plugin.oktoService.getChains();
          const chainsString = getChainsString(chains);
          elizaLogger.log("Supported Chains:", chainsString);
          
          callback?.(
            { text: `✅ Supported Chains: \n${chainsString}` },
            []
          );
        } catch (error) {
          elizaLogger.error("Okto Get Chains failed: ", error.message);
          callback?.(
            { text: `❌ Okto Get Chains failed.` },
            []
          );
        }
        
        return {
          success: true,
          response: "okto get chains successful",
        };
      } catch (error) {
        console.log("ERROR: ", error);
        return handleApiError(error);
      }
    },
  }
}