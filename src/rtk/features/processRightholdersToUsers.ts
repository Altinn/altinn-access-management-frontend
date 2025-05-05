import { PartyType, type Rightholder, type User } from './userInfoApi';

const mapUserType = (typeId: string | null): PartyType => {
  switch (typeId) {
    case '8c216e2f-afdd-4234-9ba2-691c727bb33d':
      return PartyType.Organization;
    case 'bfe09e70-e868-44b3-8d81-dfe0e13e058a':
    default:
      return PartyType.Person;
  }
};

const addUniqueRole = (roles: string[], role: string): string[] =>
  role && !roles.includes(role) ? [...roles, role] : roles;

export function processRightholdersToUsers(rightholders: Rightholder[]): User[] {
  const facilitatorMap = new Map<string, User>();
  const userMap = new Map<string, User>();

  for (const rh of rightholders) {
    if (rh.facilitator) {
      const facilitatorId = rh.facilitator.id;
      const inheritingUserId = rh.to.id;
      const inheritingUser: User = {
        partyUuid: inheritingUserId,
        partyType: mapUserType(rh.to.typeId),
        name: rh.to.name,
        registryRoles: [rh.role.name],
        organizationNumber: rh.to.refId,
        unitType: rh.to.parentId ?? undefined,
        inheritingUsers: [],
      };

      let facilitator = facilitatorMap.get(facilitatorId);
      if (!facilitator) {
        facilitator = {
          partyUuid: facilitatorId,
          partyType: mapUserType(rh.facilitator.typeId),
          name: rh.facilitator.name,
          registryRoles: [rh.facilitatorRole?.name ?? ''],
          organizationNumber: rh.facilitator.refId,
          unitType: rh.facilitator.parentId ?? undefined,
          inheritingUsers: [inheritingUser],
        };
        facilitatorMap.set(facilitatorId, facilitator);
      } else {
        facilitator.registryRoles = addUniqueRole(
          facilitator.registryRoles,
          rh.facilitatorRole?.name ?? '',
        );
        const existingInheriting = facilitator.inheritingUsers.find(
          (u) => u.partyUuid === inheritingUserId,
        );
        if (existingInheriting) {
          existingInheriting.registryRoles = addUniqueRole(
            existingInheriting.registryRoles,
            rh.role.name,
          );
        } else {
          facilitator.inheritingUsers.push(inheritingUser);
        }
      }
    } else {
      const userId = rh.to.id;
      if (!userMap.has(userId)) {
        userMap.set(userId, {
          partyUuid: rh.to.id,
          partyType: mapUserType(rh.to.typeId),
          name: rh.to.name,
          registryRoles: [rh.role.name],
          organizationNumber: rh.to.refId,
          unitType: rh.to.parentId ?? undefined,
          inheritingUsers: [],
        });
      } else {
        const existingUser = userMap.get(userId)!;
        existingUser.registryRoles = addUniqueRole(existingUser.registryRoles, rh.role.name);
      }
    }
  }
  return [...facilitatorMap.values(), ...userMap.values()];
}
