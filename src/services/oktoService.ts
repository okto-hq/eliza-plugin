import {
    elizaLogger,
    IAgentRuntime,
    Service,
    ServiceType,
    settings
} from "@elizaos/core";
import { OktoClient, OktoClientConfig } from "@okto_web3/core-js-sdk";
import { getGoogleIdToken } from "../google.ts";
import { getPortfolio, getAccount, getChains, getNftCollections, getOrdersHistory, getPortfolioNFT, getTokens } from "@okto_web3/core-js-sdk/explorer";
import { GetSupportedNetworksResponseData, Token, Order, UserNFTBalance, UserPortfolioData } from "@okto_web3/core-js-sdk/types";
import { tokenTransfer, nftTransfer, evmRawTransaction } from "@okto_web3/core-js-sdk/userop";
import { NFTTransferIntentParams, RawTransactionIntentParams, TokenTransferIntentParams, Wallet } from "../types.ts";
import { Address } from "viem";
import { ethers } from "ethers";
import { DEFAULT_CHAINS, DEFAULT_TOKENS } from "../constants.ts";

export class OktoService extends Service {
    static serviceType: ServiceType = ServiceType.TRANSCRIPTION;
    private oktoClient: OktoClient;
    public supportedChains: GetSupportedNetworksResponseData[] = DEFAULT_CHAINS;
    public supportedTokens: Token[] = DEFAULT_TOKENS;

    initialize(runtime: IAgentRuntime): Promise<void> {
        const environment = settings.OKTO_ENVIRONMENT || "sandbox";
        const clientPrivateKey = settings.OKTO_CLIENT_PRIVATE_KEY;
        if (!clientPrivateKey) {
            throw new Error("OKTO_CLIENT_PRIVATE_KEY is required for OktoPlugin and is not set");
        }
        const clientSWA = settings.OKTO_CLIENT_SWA;
        if (!clientSWA) {
            throw new Error("OKTO_CLIENT_SWA is required for OktoPlugin and is not set");
        }
        const googleClientId = settings.GOOGLE_CLIENT_ID;
        if (!googleClientId) {
            throw new Error("GOOGLE_CLIENT_ID is required for OktoPlugin and is not set");
        }
        const googleClientSecret = settings.GOOGLE_CLIENT_SECRET;
        if (!googleClientSecret) {
            throw new Error("GOOGLE_CLIENT_SECRET is required for OktoPlugin and is not set");
        }

        const clientConfig: OktoClientConfig = {
            environment: environment as any,
            clientPrivateKey: clientPrivateKey as any,
            clientSWA: clientSWA as any,
        }
        this.oktoClient = new OktoClient(clientConfig);
        
        getGoogleIdToken(googleClientId, googleClientSecret).then(async (googleTokens: any) => {
            try {
                const user = await this.oktoClient.loginUsingOAuth({
                  idToken: googleTokens.id_token,
                  provider: 'google',
                });
                elizaLogger.info("Okto Authenticateion Success", JSON.stringify(user, null, 2));
                
                const [chains, tokens] = await Promise.all([this.getChains(), this.getTokens()]);
                this.supportedChains = chains;
                this.supportedTokens = tokens;
                
            } catch (error: any) {
                elizaLogger.error("Okto Authenticateion Error", error.message);
            }
        })
        return Promise.resolve();
    }

  async getPortfolio(): Promise<UserPortfolioData> {
    return await getPortfolio(this.oktoClient);
  }

  async getAccount(): Promise<Wallet[]> {
    return await getAccount(this.oktoClient);
  }

  async getChains(): Promise<GetSupportedNetworksResponseData[]> {
    return await getChains(this.oktoClient);
  }

  async getNftCollections(): Promise<Order[]> {
    return await getNftCollections(this.oktoClient);
  }

  async getOrdersHistory(): Promise<Order[]> {
    return await getOrdersHistory(this.oktoClient);
  }

  async getPortfolioNFT(): Promise<UserNFTBalance[]> {
    return await getPortfolioNFT(this.oktoClient);
  }

  async getTokens(): Promise<Token[]> {
    return await getTokens(this.oktoClient);
  }

  async tokenTransfer(params: TokenTransferIntentParams): Promise<string> {
    const userOp = await tokenTransfer(this.oktoClient, params);
    const signedUserOp = await this.oktoClient.signUserOp(userOp);
    const tx = await this.oktoClient.executeUserOp(signedUserOp);
    return tx;
  }

  async nftTransfer(params: NFTTransferIntentParams): Promise<string> {
    const userOp = await nftTransfer(this.oktoClient, params);
    const signedUserOp = await this.oktoClient.signUserOp(userOp);
    const tx = await this.oktoClient.executeUserOp(signedUserOp);
    return tx;
  }

  async evmRawTransaction(params: RawTransactionIntentParams): Promise<string> {
    const userOp = await evmRawTransaction(this.oktoClient, params);
    const signedUserOp = await this.oktoClient.signUserOp(userOp);
    const tx = await this.oktoClient.executeUserOp(signedUserOp);
    return tx;
  }

  async tokenSwap(params: {
    amountIn: number;
    minAmountOut: number;
    from: string;
    router: string;
    tokenIn: string;
    tokenOut: string;
    chain: string;
    isNative: boolean;
  }): Promise<string> {
    const deadline = Math.floor(Date.now() / 1000) + 300;
    
    if (!params.isNative) {
      const swapAbi = [
        "function swapExactTokensForTokens(uint256 amountIn, uint256 amountOutMin, address[] calldata path, address to, uint256 deadline) returns (uint[] memory amounts)"
      ];
      const swapInterface = new ethers.utils.Interface(swapAbi);
      const amountInBN = ethers.BigNumber.from(params.amountIn);
      const minAmountOutBN = ethers.BigNumber.from(params.minAmountOut);
      const encodedData = swapInterface.encodeFunctionData("swapExactTokensForTokens", [
        amountInBN,
        minAmountOutBN,
        [params.tokenIn, params.tokenOut],
        params.from,
        deadline,
      ]);
  
      const swapTransactionIntentParams = {
        caip2Id: params.chain,
        transaction: {
          from: params.from as Address,
          to: params.router as Address,
          value: 0,
          data: encodedData as `0x${string}`,
        },
      };
      console.log("Executing ERC20 Swap Transaction with params:", swapTransactionIntentParams);
      const createdUserOp = await evmRawTransaction(this.oktoClient, swapTransactionIntentParams);
      const signedOp = await this.oktoClient.signUserOp(createdUserOp);
      return await this.oktoClient.executeUserOp(signedOp);
    } else {
      const swapAbi = [
        "function swapExactETHForTokens(uint256 amountOutMin, address[] calldata path, address to, uint256 deadline) payable returns (uint[] memory amounts)"
      ];
      const swapInterface = new ethers.utils.Interface(swapAbi);
      const minAmountOutBN = ethers.BigNumber.from(params.minAmountOut);
      const encodedData = swapInterface.encodeFunctionData("swapExactETHForTokens", [
        minAmountOutBN,
        [params.tokenIn, params.tokenOut],
        params.from,
        deadline,
      ]);
  
      const swapTransactionIntentParams = {
        caip2Id: params.chain,
        transaction: {
          from: params.from as Address,
          to: params.router as Address,
          value: Number(params.amountIn),
          data: encodedData as `0x${string}`,
        },
      };
      console.log("Executing Native Swap Transaction with params:", swapTransactionIntentParams);
      const createdUserOp = await evmRawTransaction(this.oktoClient, swapTransactionIntentParams);
      const signedOp = await this.oktoClient.signUserOp(createdUserOp);
      return await this.oktoClient.executeUserOp(signedOp);
    }
  }

    
}
