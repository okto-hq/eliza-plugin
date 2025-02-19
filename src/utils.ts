import { Content } from "@elizaos/core";
import { NETWORK_TOKEN_ADDRESS } from "./constants.ts";

export class ApiError extends Error {
  constructor(
    message: string,
    public statusCode?: number,
  ) {
    super(message);
    this.name = "ApiError";
  }
}


export const validateSearchQuery = (content: Content): string => {
  const query = typeof content === "string" ? content : content.text;
  if (!query?.trim()) {
    throw new ApiError("Search query is required");
  }
  return query.trim();
};

export const handleApiError = (
  error: unknown,
): { success: false; response: string } => {
  if (error instanceof ApiError) {
    return {
      success: false,
      response: `API Error: ${error.message}`,
    };
  }
  return {
    success: false,
    response: "An unexpected error occurred",
  };
};

// export const formatSearchResults = (results: SearchResult[]): string => {
//   return results
//     .map((result, index) => {
//       return `${index + 1}. ${result.title}\n   ${result.url}\n   ${result.snippet}\n`;
//     })
//     .join("\n");
// };

export const createRateLimiter = (maxRequests: number, timeWindow: number) => {
  const requests: number[] = [];

  return {
    checkLimit: (): boolean => {
      const now = Date.now();
      const windowStart = now - timeWindow;

      // Remove old requests
      while (requests.length > 0 && requests[0] < windowStart) {
        requests.shift();
      }

      // Check if we're at the limit
      if (requests.length >= maxRequests) {
        return false;
      }

      // Add new request
      requests.push(now);
      return true;
    },
  };
};


export function getTokenAddress(network: string, tokenSymbol: string): string {
  const normalizedNetwork = network.toUpperCase();
  const normalizedToken = tokenSymbol.toUpperCase();

  if (!(normalizedNetwork in NETWORK_TOKEN_ADDRESS)) {
    throw new Error(`Network "${network}" not supported`);
  }

  const networkTokens = NETWORK_TOKEN_ADDRESS[normalizedNetwork as keyof typeof NETWORK_TOKEN_ADDRESS];
  
  if (!(normalizedToken in networkTokens)) {
    throw new Error(`Token "${tokenSymbol}" not supported for network "${network}"`);
  }

  return networkTokens[normalizedToken as keyof typeof networkTokens];
}