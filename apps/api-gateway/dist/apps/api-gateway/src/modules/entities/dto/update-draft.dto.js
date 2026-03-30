var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
import { Jurisdiction, RiskLevel } from '@treasuryos/types';
import { IsEnum, IsOptional, MaxLength, MinLength } from 'class-validator';
export class UpdateDraftDto {
    jurisdiction;
    legalName;
    notes;
    riskLevel;
}
__decorate([
    IsEnum(Jurisdiction),
    IsOptional(),
    __metadata("design:type", String)
], UpdateDraftDto.prototype, "jurisdiction", void 0);
__decorate([
    MinLength(2),
    MaxLength(200),
    IsOptional(),
    __metadata("design:type", String)
], UpdateDraftDto.prototype, "legalName", void 0);
__decorate([
    IsOptional(),
    MaxLength(4000),
    __metadata("design:type", String)
], UpdateDraftDto.prototype, "notes", void 0);
__decorate([
    IsEnum(RiskLevel),
    IsOptional(),
    __metadata("design:type", String)
], UpdateDraftDto.prototype, "riskLevel", void 0);
//# sourceMappingURL=update-draft.dto.js.map