import { Paragraph } from '@digdir/designsystemet-react';
import { Button, ListBase } from '@altinn/altinn-components';
import { MinusCircleIcon, PlusCircleIcon } from '@navikt/aksel-icons';
import { useTranslation } from 'react-i18next';
import { use } from 'chai';

import { ButtonWithConfirmPopup } from '../ButtonWithConfirmPopup/ButtonWithConfirmPopup';
import { DelegationAction } from '../DelegationModal/EditModal';

import classes from './AccessPackageList.module.css';
import type { ExtendedAccessArea } from './useAreaPackageList';
import { PackageItem } from './PackageItem';

import { useDelegationCheckQuery, type AccessPackage } from '@/rtk/features/accessPackageApi';

interface AreaItemContentProps {
  area: ExtendedAccessArea;
  availableActions?: DelegationAction[];
  onSelect?: (accessPackage: AccessPackage) => void;
  onDelegate: (accessPackage: AccessPackage) => void;
  onRevoke: (accessPackage: AccessPackage) => void;
  onRequest: (accessPackage: AccessPackage) => void;
  useDeleteConfirm?: boolean;
}

export const AreaItemContent = ({
  area,
  availableActions,
  onSelect,
  onDelegate,
  onRevoke,
  onRequest,
  useDeleteConfirm,
}: AreaItemContentProps) => {
  const { packages } = area;
  const { t } = useTranslation();

  const { data: delegationChecks } = useDelegationCheckQuery({
    packageIds: area.packages.available.map((p) => p.id),
  });

  return (
    <div className={classes.accessAreaContent}>
      <Paragraph>{area.description}</Paragraph>
      {packages.assigned.length > 0 && (
        <ListBase>
          {packages.assigned.map((pkg) => {
            return (
              <PackageItem
                key={pkg.id}
                pkg={pkg}
                onSelect={onSelect}
                hasAccess
                controls={
                  availableActions?.includes(DelegationAction.REVOKE) && useDeleteConfirm ? (
                    <ButtonWithConfirmPopup
                      triggerButtonContent={t('common.delete_poa')}
                      triggerButtonProps={{
                        icon: MinusCircleIcon,
                        variant: 'text',
                        size: 'sm',
                        disabled: pkg.inherited,
                      }}
                      popoverProps={{
                        color: 'neutral',
                      }}
                      message={t('user_rights_page.delete_confirm_message', {
                        name: pkg.name,
                      })}
                      data-size='sm'
                      onConfirm={() => onRevoke(pkg)}
                    />
                  ) : (
                    <Button
                      icon={MinusCircleIcon}
                      variant='text'
                      size='sm'
                      disabled={pkg.inherited}
                      onClick={() => onRevoke(pkg)}
                    >
                      {t('common.delete_poa')}
                    </Button>
                  )
                }
              />
            );
          })}
        </ListBase>
      )}
      {packages.available.length > 0 && (
        <ListBase>
          {packages.available.map((pkg) => {
            const delegationCheck = delegationChecks?.find((dc) => dc.packageId === pkg.id);
            console.log('🚀 ~ {packages.available.map ~ delegationCheck:', delegationCheck);
            return (
              <PackageItem
                key={pkg.id}
                pkg={pkg}
                onSelect={onSelect}
                controls={
                  <>
                    {availableActions?.includes(DelegationAction.DELEGATE) && (
                      <Button
                        icon={PlusCircleIcon}
                        variant='text'
                        size='sm'
                        onClick={() => onDelegate(pkg)}
                      >
                        {t('common.give_poa')}
                      </Button>
                    )}
                    {availableActions?.includes(DelegationAction.REQUEST) && (
                      <Button
                        icon={PlusCircleIcon}
                        variant='text'
                        size='sm'
                        disabled
                        onClick={() => onRequest(pkg)}
                      >
                        {t('common.request_poa')}
                      </Button>
                    )}
                  </>
                }
              />
            );
          })}
        </ListBase>
      )}
    </div>
  );
};
