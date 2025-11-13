import { useTranslation } from 'react-i18next';
import { DelegationAction } from '../EditModal';
import { usePartyRepresentation } from '../../PartyRepresentationContext/PartyRepresentationContext';
import classes from './RoleInfo.module.css';
import {
  useGetRoleByIdQuery,
  useGetRoleConnectionsQuery,
  useGetRolePackagesQuery,
  useGetRoleResourcesQuery,
} from '@/rtk/features/roleApi';

export interface PackageInfoProps {
  role: any;
  onDelegate?: () => void;
  availableActions?: DelegationAction[];
}

export const RoleInfo = ({ role, availableActions = [] }: PackageInfoProps) => {
  console.log('role: ', role);
  const { t } = useTranslation();

  const { fromParty, toParty, actingParty } = usePartyRepresentation();
  const { data: activeDelegations, isFetching } = useGetRoleConnectionsQuery({
    party: actingParty?.partyUuid ?? '',
    from: fromParty?.partyUuid ?? '',
    to: toParty?.partyUuid ?? '',
  });

  const { data: roleData, isLoading: roleDataIsLoading } = useGetRoleByIdQuery(role.id);
  // console.log('roleData: ', roleData);

  // These queries are currently not available from the backend API, but should be implemented in the future.
  // const { data: rolePackages, isLoading: rolePackagesIsLoading } = useGetRolePackagesQuery(role.id);
  // const { data: roleResources, isLoading: roleResourcesIsLoading } = useGetRoleResourcesQuery(role.id);

  // const assignment = useMemo(() => {
  //   if (activeDelegations && !isFetching) {
  //     return activeDelegations.find((assignment) => assignment.role.id === role.id);
  //   }
  //   return null;
  // }, [activeDelegations, isFetching, role.id]);

  // const userHasRole = !!assignment;
  // const userHasInheritedRole = assignment?.inherited && assignment.inherited.length > 0;
  // const inheritedFromRoleName = userHasInheritedRole ? assignment?.inherited[0]?.name : undefined;

  return <></>;
  // <div className={classes.container}>
  //   <div className={classes.header}>
  //     <Avatar
  //       size='md'
  //       name={role?.name}
  //       imageUrl={role?.area?.iconUrl}
  //       imageUrlAlt={role?.area?.name}
  //       type='company'
  //     />
  //     <DsHeading
  //       level={3}
  //       data-size='sm'
  //     >
  //       {role?.name}
  //     </DsHeading>
  //   </div>

  //   {!!actionError && (
  //     <DsAlert
  //       data-color='danger'
  //       data-size='sm'
  //     >
  //       {userHasRole ? (
  //         <DsHeading
  //           level={4}
  //           data-size='2xs'
  //         >
  //           {t('delegation_modal.general_error.revoke_heading')}
  //         </DsHeading>
  //       ) : (
  //         <DsHeading
  //           level={4}
  //           data-size='2xs'
  //         >
  //           {t('delegation_modal.general_error.delegate_heading')}
  //         </DsHeading>
  //       )}
  //       <TechnicalErrorParagraphs
  //         size='xs'
  //         status={actionError.httpStatus}
  //         time={actionError.timestamp}
  //       />
  //     </DsAlert>
  //   )}

  //   <StatusSection
  //     userHasAccess={userHasRole}
  //     showMissingRightsMessage={!userHasRole && !delegationCheckResult?.canDelegate}
  //     inheritedFrom={inheritedFromRoleName}
  //     delegationCheckText={
  //       delegationCheckResult?.detailCode !== ErrorCode.Unknown
  //         ? getErrorCodeTextKey(delegationCheckResult?.detailCode)
  //         : 'role.cant_delegate_generic'
  //     }
  //   />

  //   <DsParagraph>{role?.description}</DsParagraph>

  //   <div className={classes.actions}>
  //     {!userHasRole && availableActions.includes(DelegationAction.REQUEST) && (
  //       <RequestRoleButton
  //         variant='solid'
  //         size='md'
  //         icon={false}
  //       />
  //     )}
  //     {!userHasRole && availableActions.includes(DelegationAction.DELEGATE) && (
  //       <DelegateRoleButton
  //         accessRole={role}
  //         fullText
  //         disabled={isFetching || !role.isDelegable || !delegationCheckResult?.canDelegate}
  //         variant='solid'
  //         size='md'
  //         icon={false}
  //         onDelegateError={(_role: Role, error: ActionError) => {
  //           setActionError(error);
  //         }}
  //       />
  //     )}
  //     {userHasRole && role && availableActions.includes(DelegationAction.REVOKE) && (
  //       <RevokeRoleButton
  //         assignmentId={assignment.id}
  //         accessRole={role}
  //         fullText
  //         disabled={isFetching || userHasInheritedRole}
  //         variant='solid'
  //         size='md'
  //         icon={false}
  //         onRevokeError={function (_role: Role, errorInfo: ActionError): void {
  //           setActionError(errorInfo);
  //         }}
  //       />
  //     )}
  //   </div>
  // </div>
  // );
};
