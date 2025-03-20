import { Alert, Heading, Paragraph } from '@digdir/designsystemet-react';
import { Button, ListBase } from '@altinn/altinn-components';
import { MinusCircleIcon, PlusCircleIcon } from '@navikt/aksel-icons';
import { useTranslation } from 'react-i18next';
import { useMemo, useState } from 'react';

import type { AccessPackage } from '@/rtk/features/accessPackageApi';

import { ButtonWithConfirmPopup } from '../ButtonWithConfirmPopup/ButtonWithConfirmPopup';
import { DelegationAction } from '../DelegationModal/EditModal';

import classes from './AccessPackageList.module.css';
import type { ExtendedAccessArea } from './useAreaPackageList';
import { PackageItem } from './PackageItem';
import { useAccessPackageDelegationCheck } from '@/resources/hooks/useAccessPackageDelegationCheck';
import { ActionError } from '@/resources/hooks/useActionError';
import { TechnicalErrorParagraphs } from '../TechnicalErrorParagraphs';
import { useIsMobileOrSmaller } from '@/resources/utils/screensizeUtils';
import cn from 'classnames';

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
  const [delegationCheckError, setDelegationCheckError] = useState<ActionError | null>(null);
  const availablePackageIds = useMemo(
    () => packages.available.map((pkg) => pkg.id),
    [packages.available],
  );
  const handleDelegationCheckFailure = (error: ActionError) => {
    setDelegationCheckError(error);
  };
  const shouldShowDelegationCheck = !!availableActions?.includes(DelegationAction.DELEGATE);
  const { canDelegate, isLoading } = useAccessPackageDelegationCheck(
    availablePackageIds,
    shouldShowDelegationCheck,
    handleDelegationCheckFailure,
  );
  const isSm = useIsMobileOrSmaller();
  return (
    <div className={cn(classes.accessAreaContent, !isSm && classes.accessAreaContentMargin)}>
      <Paragraph>{area.description}</Paragraph>
      {delegationCheckError && (
        <Alert data-color='danger'>
          <Heading level={3}>
            {t('access_packages.delegation_check.delegation_check_error_heading')}
          </Heading>
          <TechnicalErrorParagraphs
            message={t('access_packages.delegation_check.delegation_check_error_message_plural', {
              count: 2,
            })}
            status={delegationCheckError.httpStatus}
            time={delegationCheckError.timestamp}
          />
        </Alert>
      )}
      {packages.assigned.length > 0 && (
        <ListBase>
          {packages.assigned.map((pkg) => (
            <PackageItem
              key={pkg.id}
              pkg={pkg}
              onSelect={onSelect}
              hasAccess
              controls={
                !isSm &&
                (availableActions?.includes(DelegationAction.REVOKE) && useDeleteConfirm ? (
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
                ))
              }
            />
          ))}
        </ListBase>
      )}
      {packages.available.length > 0 && (
        <ListBase>
          {packages.available.map((pkg) => (
            <PackageItem
              key={pkg.id}
              pkg={pkg}
              onSelect={onSelect}
              controls={
                !isSm && (
                  <>
                    {availableActions?.includes(DelegationAction.DELEGATE) && (
                      <Button
                        icon={PlusCircleIcon}
                        variant='text'
                        size='sm'
                        disabled={!canDelegate(pkg.id) || isLoading}
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
                )
              }
            />
          ))}
        </ListBase>
      )}
    </div>
  );
};
