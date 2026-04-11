import { UserRole, type AuthenticatedUser } from '@treasuryos/types';

const entityDraftCreatorRoles = new Set<UserRole>([
  UserRole.Admin,
  UserRole.ComplianceOfficer,
]);

const observabilityViewerRoles = new Set<UserRole>([UserRole.Admin]);

export function canCreateEntityDraft(user: Pick<AuthenticatedUser, 'roles'> | null | undefined) {
  return Boolean(user?.roles.some((role) => entityDraftCreatorRoles.has(role)));
}

export function canEditEntityInfo(user: Pick<AuthenticatedUser, 'roles'> | null | undefined) {
  return canCreateEntityDraft(user);
}

export function canAccessObservability(user: Pick<AuthenticatedUser, 'roles'> | null | undefined) {
  return Boolean(user?.roles.some((role) => observabilityViewerRoles.has(role)));
}
