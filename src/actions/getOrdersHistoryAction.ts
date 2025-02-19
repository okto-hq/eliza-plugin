import { Action, elizaLogger, HandlerCallback, IAgentRuntime, Memory, State } from "@elizaos/core";
import { handleApiError, validateSearchQuery } from "../utils.ts";
import { OktoPlugin } from "../index.ts";
import { Order } from "@okto_web3/core-js-sdk/types";

export function getOrdersHistoryString(orders: Order[]): string {
  if (!orders || orders.length === 0) {
    return "No orders history available.";
  }
  
  let output = "Okto Orders History\n";
  output += "=====================\n\n";
  
  orders.forEach((order, index) => {
    output += `Order ${index + 1}:\n`;
    output += `  Intent ID              : ${order.intentId}\n`;
    output += `  Intent Type            : ${order.intentType}\n`;
    output += `  Status                 : ${order.status}\n`;
    output += `  Network Name           : ${order.networkName}\n`;
    output += `  CAIP ID                : ${order.caipId}\n`;
    output += `  Transaction Hashes     : ${order.transactionHash.join(", ")}\n`;
    output += `  Downstream Tx Hashes   : ${order.downstreamTransactionHash.join(", ")}\n`;
    output += `  Details                : ${JSON.stringify(order.details, null, 2)}\n`;
    output += "\n";
  });
  
  return output;
}

export const getOrdersHistoryAction = (plugin: OktoPlugin): Action => {
    return {
      name: "OKTO_GET_ORDERS_HISTORY",
      description: "Get Okto Orders History",
      examples: [
        [
          { user: "user", content: { text: "get orders history" } },
        ],
      ],
      similes: ["OKTO_GET_ORDERS_HISTORY", "GET_ORDERS_HISTORY", "ORDERS_HISTORY", "FETCH_ORDERS_HISTORY"],
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
            const ordersHistory = await plugin.oktoService.getOrdersHistory();
            const ordersHistoryString = getOrdersHistoryString(ordersHistory);
            elizaLogger.log("Okto Orders History: ", ordersHistoryString);

            callback?.(
              { text: `✅ Okto Orders History: \n${ordersHistoryString}` },
              []
            );
          } catch (error) {
            elizaLogger.error("Okto Get Orders History failed: ", error.message);
            callback?.(
              { text: `❌ Okto Get Orders History failed.` },
              []
            );
          }

          return {
            success: true,
            response: "okto get orders history successful",
          };
        } catch (error) {
          console.log("ERROR: ", error);
          return handleApiError(error);
        }
      },
    }
}