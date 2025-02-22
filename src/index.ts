import {
  Plugin,
  Action,
  Service,
  elizaLogger,
} from "@elizaos/core";
import { getPortfolioAction } from "./actions/getPortfolioAction.ts";
import { getAccountAction } from "./actions/getAccountAction.ts";
import { getChainAction } from "./actions/getChainAction.ts";
import { getNftCollectionsAction } from "./actions/getNftCollectionsAction.ts";
import { getOrdersHistoryAction } from "./actions/getOrdersHistoryAction.ts";
import { getPortfolioNftAction } from "./actions/getPortfolioNftAction.ts";
import { getTokensAction } from "./actions/getTokensAction.ts";
import { transferTokensAction } from "./actions/transferTokensAction.ts";
import { nftTransferAction } from "./actions/nftTransferAction.ts";
import { OktoService } from "./services/oktoService.ts";
import { swapTokensAction } from "./actions/swapAction.ts";

class OktoPlugin implements Plugin {
  readonly name: string = "okto";
  readonly description: string = "Interface web3 with Okto API";
  public oktoService: OktoService = new OktoService();

  constructor() {
    elizaLogger.info("initiailizing okto plugin")
  }

  actions: Action[] = [
    getPortfolioAction(this),
    getAccountAction(this),
    getChainAction(this),
    getNftCollectionsAction(this),
    getOrdersHistoryAction(this),
    getPortfolioNftAction(this),
    getTokensAction(this),
    transferTokensAction(this),
    nftTransferAction(this),
    //swapTokensAction(this),
  ];

  services: Service[] = [this.oktoService];
}

export { OktoPlugin, OktoService };