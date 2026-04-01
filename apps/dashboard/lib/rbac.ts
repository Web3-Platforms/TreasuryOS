import { UserRole, type AuthenticatedUser } from '@treasuryos/types';

const entityDraftCreatorRoles = new Set<UserRole>([
  UserRole.Admin,
  UserRole.ComplianceOfficer,
]);

export function canCreateEntityDraft(user: Pick<AuthenticatedUser, 'roles'> | null | undefined) {
  return Boolean(user?.roles.some((role) => entityDraftCreatorRoles.has(role)));
}
