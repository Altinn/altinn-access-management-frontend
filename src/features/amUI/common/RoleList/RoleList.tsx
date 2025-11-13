import type { Role } from '@/rtk/features/roleApi';
import { useGetRoleConnectionsQuery } from '@/rtk/features/roleApi';
import type { ActionError } from '@/resources/hooks/useActionError';
import { usePartyRepresentation } from '../PartyRepresentationContext/PartyRepresentationContext';
import { SkeletonRoleList } from './SkeletonRoleList';
import {
  createErrorDetails,
  TechnicalErrorParagraphs,
} from '../TechnicalErrorParagraphs/TechnicalErrorParagraphs';
import { useGroupedRoleListEntries } from './useGroupedRoleListEntries';
import { DsAlert, DsHeading, List } from '@altinn/altinn-components';
import { t } from 'i18next';
import { RoleListItem } from './RoleListItem';
import classes from './roleSection.module.css';

interface RoleListProps {
  onSelect: (role: Role) => void;
  isLoading?: boolean;
}

export const RoleList = ({ onSelect, isLoading }: RoleListProps) => {
  const { fromParty, toParty, isLoading: partyIsLoading } = usePartyRepresentation();
  const {
    data: roleConnections,
    isLoading: roleConnectionsIsLoading,
    error: roleConnectionsError,
  } = useGetRoleConnectionsQuery({
    party: fromParty?.partyUuid ?? '',
    from: fromParty?.partyUuid,
    to: toParty?.partyUuid,
  });

  const { altinn2Roles } = useGroupedRoleListEntries({
    roleConnections,
  });

  if (roleConnectionsIsLoading || partyIsLoading || isLoading) {
    return <SkeletonRoleList />;
  }
  if (roleConnectionsError) {
    const roleFetchErrorDetails = createErrorDetails(roleConnectionsError);

    return (
      <div className={classes.roleLists}>
        <DsAlert
          data-color='danger'
          data-size='sm'
        >
          <DsHeading
            level={3}
            data-size='2xs'
          >
            {t('role.fetch_error_heading')}
          </DsHeading>
          <TechnicalErrorParagraphs
            size='xs'
            status={roleFetchErrorDetails?.status ?? ''}
            time={roleFetchErrorDetails?.time ?? ''}
            traceId={roleFetchErrorDetails?.traceId ?? ''}
          />
        </DsAlert>
      </div>
    );
  }
  return (
    <div className={classes.roleArea}>
      <List>
        {altinn2Roles.map(({ role }) => {
          return (
            <RoleListItem
              key={role.id}
              role={role}
              onClick={() => onSelect(role)}
            />
          );
        })}
      </List>
    </div>
  );
  // const { data: roleAreas, isLoading: roleAreasIsLoading } = useGetRolesQuery();
  // const { data: userRoles, isLoading: userRolesIsLoading } = useGetRolesForUserQuery({
  //   from: fromParty?.partyUuid ?? '',
  //   to: toParty?.partyUuid ?? '',
  // });

  // const isSm = useIsMobileOrSmaller();

  // const groupedRoles = useMemo(() => {
  //   return roleAreas?.reduce(
  //     (res, roleArea) => {
  //       roleArea.roles.forEach((role) => {
  //         const roleAssignment = userRoles?.find((userRole) => userRole.role.id === role.id);
  //         if (roleAssignment) {
  //           res.activeRoles.push({
  //             ...role,
  //             inherited: roleAssignment.inherited,
  //             assignmentId: roleAssignment.id,
  //           });
  //         } else {
  //           res.availableRoles.push({ ...role, inherited: [] });
  //         }
  //       });
  //       return res;
  //     },
  //     {
  //       activeRoles: [] as ExtendedRole[],
  //       availableRoles: [] as ExtendedRole[],
  //     },
  //   );
  // }, [roleAreas, userRoles]);

  // if (partyIsLoading || roleAreasIsLoading || userRolesIsLoading || isLoading) {
  //   return <SkeletonRoleList />;
  // }
  // return (
  //   <div className={classes.roleLists}>
  //     {groupedRoles && groupedRoles.activeRoles.length > 0 && (
  //       <List>
  //         {groupedRoles.activeRoles.map((role) => (
  //           <RoleListItem
  //             key={role.id}
  //             role={role}
  //             active
  //             onClick={() => {
  //               onSelect(role);
  //             }}
  //             controls={
  //               !isSm &&
  //               availableActions?.includes(DelegationAction.REVOKE) && (
  //                 <RevokeRoleButton
  //                   key={role.id}
  //                   assignmentId={role?.assignmentId ?? ''}
  //                   accessRole={role}
  //                   fullText={false}
  //                   size='sm'
  //                   disabled={role.inherited?.length > 0}
  //                   onRevokeError={onActionError}
  //                 />
  //               )
  //             }
  //           />
  //         ))}
  //       </List>
  //     )}
  //     {groupedRoles && groupedRoles.availableRoles.length > 0 && (
  //       <List>
  //         {groupedRoles.availableRoles.map((role) => (
  //           <RoleListItem
  //             key={role.id}
  //             role={role}
  //             onClick={() => onSelect(role)}
  //             controls={
  //               !isSm && (
  //                 <>
  //                   {availableActions?.includes(DelegationAction.DELEGATE) && (
  //                     <DelegateRoleButton
  //                       accessRole={role}
  //                       key={role.id}
  //                       fullText={false}
  //                       size='sm'
  //                       onDelegateError={onActionError}
  //                       onSelect={() => {
  //                         onSelect(role);
  //                       }}
  //                       showSpinner={true}
  //                       showWarning={true}
  //                     />
  //                   )}
  //                   {availableActions?.includes(DelegationAction.REQUEST) && <RequestRoleButton />}
  //                 </>
  //               )
  //             }
  //           />
  //         ))}
  //       </List>
  //     )}
  //   </div>
  // );
};
