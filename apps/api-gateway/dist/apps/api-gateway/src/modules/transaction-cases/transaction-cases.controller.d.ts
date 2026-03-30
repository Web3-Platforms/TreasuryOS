import type { ApiRequest } from '../../common/http-request.js';
import { TransactionCasesService } from './transaction-cases.service.js';
import { ScreenTransactionDto } from './dto/screen-transaction.dto.js';
import { DecisionTransitionDto } from './dto/decision-transition.dto.js';
import { ListCasesQueryDto } from './dto/list-cases-query.dto.js';
import { ReviewTransitionDto } from './dto/review-transition.dto.js';
export declare class TransactionCasesController {
    private readonly transactionCasesService;
    constructor(transactionCasesService: TransactionCasesService);
    listCases(query: ListCasesQueryDto): Promise<{
        cases: import("@treasuryos/types").ReviewedTransaction[];
    }>;
    getCase(caseId: string): Promise<import("@treasuryos/types").ReviewedTransaction>;
    screenTransaction(body: ScreenTransactionDto, request: ApiRequest): Promise<{
        caseOpened: boolean;
        entityId: string;
        riskLevel: import("@treasuryos/types").RiskLevel;
        screeningDecision: string;
        transactionReference: string;
        triggeredRules: string[];
        walletId: string;
        case?: undefined;
    } | {
        case: import("@treasuryos/types").ReviewedTransaction;
        caseOpened: boolean;
        screeningDecision: string;
        triggeredRules: string[];
        entityId?: undefined;
        riskLevel?: undefined;
        transactionReference?: undefined;
        walletId?: undefined;
    }>;
    markUnderReview(caseId: string, body: ReviewTransitionDto, request: ApiRequest): Promise<import("@treasuryos/types").ReviewedTransaction>;
    approveCase(caseId: string, body: DecisionTransitionDto, request: ApiRequest): Promise<import("@treasuryos/types").ReviewedTransaction>;
    rejectCase(caseId: string, body: DecisionTransitionDto, request: ApiRequest): Promise<import("@treasuryos/types").ReviewedTransaction>;
    escalateCase(caseId: string, body: DecisionTransitionDto, request: ApiRequest): Promise<import("@treasuryos/types").ReviewedTransaction>;
}
