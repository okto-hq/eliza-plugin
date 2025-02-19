import { Address, Hash } from "@okto_web3/core-js-sdk/types";
import { PartialBy } from 'viem';

export type TokenTransferIntentParams = {
    amount: number | bigint;
    recipient: Address;
    token: Address | '';
    caip2Id: string;
};

export type NFTTransferIntentParams = {
    caip2Id: string;
    collectionAddress: Address;
    nftId: string;
    recipientWalletAddress: Address;
    amount: number | bigint;
    nftType: 'ERC721' | 'ERC1155';
};

export type EVMRawTransaction = {
    from: Address;
    to: Address;
    data: Hash;
    value: Hash;
};

export type RawTransactionIntentParams = {
    caip2Id: string;
    transaction: Omit<PartialBy<EVMRawTransaction, 'data' | 'value'>, 'value'> & {
        value?: number | bigint;
    };
};

export type Token = {
    address: string;
    caipId: string;
    symbol: string;
    image: string;
    name: string;
    shortName: string;
    id: string;
    groupId: string;
    isPrimary: boolean;
    caip2Id: string;
    networkName: string;
    isOnrampEnabled: boolean;
};

export type Wallet = {
    caipId: string;
    networkName: string;
    address: string;
    caip2Id: string;
    networkSymbol: string;
};