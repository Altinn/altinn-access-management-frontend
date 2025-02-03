import { useParams } from 'react-router-dom';
import { Paragraph, Heading } from '@digdir/designsystemet-react';
import { useRef, useState } from 'react';

import type { ExtendedRole, Role } from '@/rtk/features/roleApi';
import { useGetRolesForUserQuery, useGetRolesQuery } from '@/rtk/features/roleApi';
import { useGetReporteeQuery } from '@/rtk/features/userInfoApi';
import { useGetPartyByUUIDQuery } from '@/rtk/features/lookupApi';

import classes from './roleSection.module.css';
import { RoleInfoModal } from './RoleInfoModal';
import { RoleListItem } from './RoleListItem';

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
        const { activeRoles, availableRoles } = roleArea.roles.reduce(
          (res, role) => {
            const roleAssignment = userRoles?.find((userRole) => userRole.role.id === role.id);
            if (roleAssignment)
              res.activeRoles.push({
                ...role,
                inherited: roleAssignment.inherited,
                assignmentId: roleAssignment.id,
              });
            else res.availableRoles.push({ ...role, inherited: [] });
            return res;
          },
          {
            activeRoles: [] as ExtendedRole[],
            availableRoles: [] as ExtendedRole[],
          },
        );
        return (
          <div
            key={roleArea.id}
            className={classes.roleArea}
          >
            <Heading
              level={2}
              size='xs'
              id={roleArea.id}
            >
              {roleArea.name}
            </Heading>
            <Paragraph size='sm'>{roleArea.description}</Paragraph>
            {party && activeRoles.length > 0 && (
              <ul className={classes.roleList}>
                {activeRoles.map((role) => {
                  return (
                    <RoleListItem
                      reporteeUuid={reportee?.partyUuid || ''}
                      key={role.id}
                      role={role}
                      onClick={() => {
                        setModalItem(role);
                        modalRef.current?.showModal();
                      }}
                      toParty={party}
                      assignmentId={role.assignmentId}
                    />
                  );
                })}
              </ul>
            )}
            {party && availableRoles.length > 0 && (
              <ul className={classes.roleList}>
                {availableRoles.map((role) => {
                  return (
                    <RoleListItem
                      reporteeUuid={reportee?.partyUuid || ''}
                      key={role.id}
                      role={role}
                      onClick={() => {
                        setModalItem(role);
                        modalRef.current?.showModal();
                      }}
                      toParty={party}
                    />
                  );
                })}
              </ul>
            )}
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
