import { useParams } from 'react-router-dom';
import { AccessPackageListItem } from '@altinn/altinn-components';
import { Paragraph, Heading } from '@digdir/designsystemet-react';
import { useRef, useState } from 'react';

import type { Role } from '@/rtk/features/roleApi';
import { useGetRolesForUserQuery, useGetRolesQuery } from '@/rtk/features/roleApi';
import { useGetReporteeQuery } from '@/rtk/features/userInfoApi';
import { useGetPartyByUUIDQuery } from '@/rtk/features/lookupApi';

import classes from './roleSection.module.css';
import { RoleInfoModal } from './RoleInfoModal';
import { RevokeRoleButton } from './RevokeRoleButton';
import { DelegateRoleButton } from './DelegateRoleButton';

export const RoleSection = () => {
  const modalRef = useRef<HTMLDialogElement>(null);
  const [modalItem, setModalItem] = useState<Role | undefined>(undefined);

  const { data: reportee } = useGetReporteeQuery();
  const { id: rightHolderUuid } = useParams();
  const { data: party } = useGetPartyByUUIDQuery(rightHolderUuid ?? '');

  const { data: userRoles } = useGetRolesForUserQuery({
    rightOwnerUuid: reportee?.partyUuid ?? '',
    rightHolderUuid: rightHolderUuid ?? '',
  });

  const { data: roleAreas } = useGetRolesQuery();

  return (
    <div className={classes.roleSection}>
      {roleAreas?.map((roleArea) => {
        return (
          <div key={roleArea.id}>
            <Heading
              level={2}
              size='xs'
              id={roleArea.id}
            >
              {roleArea.name}
            </Heading>
            <Paragraph size='sm'>{roleArea.description}</Paragraph>
            <ul className={classes.roleList}>
              {roleArea.roles.map((role) => {
                const userHasRole = userRoles?.find((userRole) => userRole.role.id === role.id);
                return (
                  <li key={role.id}>
                    <AccessPackageListItem
                      id={role.id}
                      onClick={() => {
                        setModalItem(role);
                        modalRef.current?.showModal();
                      }}
                      as='button'
                      title={role.name}
                      size='sm'
                      controls={[
                        userHasRole ? (
                          <RevokeRoleButton
                            key={role.id}
                            roleId={role.id}
                            roleName={role.name}
                            toParty={party}
                            fullText={false}
                            size='sm'
                          />
                        ) : (
                          <DelegateRoleButton
                            key={role.id}
                            roleId={role.id}
                            roleName={role.name}
                            toParty={party}
                            fullText={false}
                            size='sm'
                          />
                        ),
                      ]}
                    />
                  </li>
                );
              })}
            </ul>
          </div>
        );
      })}

      {party && (
        <RoleInfoModal
          modalRef={modalRef}
          toParty={party}
          role={modalItem}
          onClose={() => setModalItem(undefined)}
        />
      )}
    </div>
  );
};
