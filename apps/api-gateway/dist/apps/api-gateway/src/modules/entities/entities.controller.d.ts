import type { ApiRequest } from '../../common/http-request.js';
import { EntitiesService } from './entities.service.js';
import { CreateEntityDto } from './dto/create-entity.dto.js';
import { UpdateDraftDto } from './dto/update-draft.dto.js';
import { EntityDecisionDto } from './dto/entity-decision.dto.js';
export declare class EntitiesController {
    private readonly entitiesService;
    constructor(entitiesService: EntitiesService);
    listEntities(): Promise<{
        entities: import("@treasuryos/types").EntityRecord[];
    }>;
    getEntity(entityId: string): Promise<import("@treasuryos/types").EntityRecord>;
    createEntity(body: CreateEntityDto, request: ApiRequest): Promise<import("@treasuryos/types").EntityRecord>;
    updateEntity(entityId: string, body: UpdateDraftDto, request: ApiRequest): Promise<import("@treasuryos/types").EntityRecord>;
    submitEntity(entityId: string, request: ApiRequest): Promise<import("@treasuryos/types").EntityRecord>;
    approveEntity(entityId: string, body: EntityDecisionDto, request: ApiRequest): Promise<import("@treasuryos/types").EntityRecord>;
    rejectEntity(entityId: string, body: EntityDecisionDto, request: ApiRequest): Promise<import("@treasuryos/types").EntityRecord>;
}
