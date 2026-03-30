import type { ApiRequest } from '../../common/http-request.js';
import { WalletsService } from './wallets.service.js';
import { RequestWalletDto } from './dto/request-wallet.dto.js';
import { WalletDecisionDto } from './dto/wallet-decision.dto.js';
export declare class WalletsController {
    private readonly walletsService;
    constructor(walletsService: WalletsService);
    listWallets(query: unknown): Promise<{
        wallets: import("@treasuryos/types").WalletRecord[];
    }>;
    getWallet(walletId: string): Promise<import("@treasuryos/types").WalletRecord>;
    requestWallet(body: RequestWalletDto, request: ApiRequest): Promise<import("@treasuryos/types").WalletRecord>;
    reviewWallet(walletId: string, body: WalletDecisionDto, request: ApiRequest): Promise<import("@treasuryos/types").WalletRecord>;
    approveWallet(walletId: string, body: WalletDecisionDto, request: ApiRequest): Promise<import("@treasuryos/types").WalletRecord>;
    rejectWallet(walletId: string, body: WalletDecisionDto, request: ApiRequest): Promise<import("@treasuryos/types").WalletRecord>;
}
