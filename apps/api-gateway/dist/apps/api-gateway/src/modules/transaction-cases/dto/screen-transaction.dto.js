var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
import { Jurisdiction } from '@treasuryos/types';
import { IsBoolean, IsEnum, IsNotEmpty, IsNumber, IsOptional, IsPositive, IsString, Max, MaxLength, MinLength, } from 'class-validator';
export class ScreenTransactionDto {
    amount;
    asset = 'USDC';
    destinationWallet;
    entityId;
    jurisdiction;
    manualReviewRequested = false;
    notes;
    referenceId;
    sourceWallet;
    walletId;
}
__decorate([
    IsNumber(),
    IsPositive(),
    Max(1_000_000_000),
    __metadata("design:type", Number)
], ScreenTransactionDto.prototype, "amount", void 0);
__decorate([
    IsString(),
    MinLength(2),
    MaxLength(24),
    __metadata("design:type", String)
], ScreenTransactionDto.prototype, "asset", void 0);
__decorate([
    IsString(),
    MinLength(32),
    MaxLength(64),
    __metadata("design:type", String)
], ScreenTransactionDto.prototype, "destinationWallet", void 0);
__decorate([
    IsString(),
    IsNotEmpty(),
    __metadata("design:type", String)
], ScreenTransactionDto.prototype, "entityId", void 0);
__decorate([
    IsEnum(Jurisdiction),
    IsOptional(),
    __metadata("design:type", String)
], ScreenTransactionDto.prototype, "jurisdiction", void 0);
__decorate([
    IsBoolean(),
    IsOptional(),
    __metadata("design:type", Boolean)
], ScreenTransactionDto.prototype, "manualReviewRequested", void 0);
__decorate([
    IsOptional(),
    MaxLength(4000),
    __metadata("design:type", String)
], ScreenTransactionDto.prototype, "notes", void 0);
__decorate([
    IsOptional(),
    IsString(),
    MinLength(3),
    MaxLength(120),
    __metadata("design:type", String)
], ScreenTransactionDto.prototype, "referenceId", void 0);
__decorate([
    IsString(),
    MinLength(32),
    MaxLength(64),
    __metadata("design:type", String)
], ScreenTransactionDto.prototype, "sourceWallet", void 0);
__decorate([
    IsOptional(),
    IsString(),
    __metadata("design:type", String)
], ScreenTransactionDto.prototype, "walletId", void 0);
//# sourceMappingURL=screen-transaction.dto.js.map