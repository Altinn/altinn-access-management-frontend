import React, { useState } from 'react';
import type { TFunction } from 'i18next';
import { useTranslation } from 'react-i18next';
import { Button, DsSpinner, type AccessPackageListItemProps } from '@altinn/altinn-components';
import { MinusCircleIcon, PlusCircleIcon } from '@navikt/aksel-icons';

import type { AccessPackage } from '@/rtk/features/accessPackageApi';
import type { ActionError } from '@/resources/hooks/useActionError';
import type { ServiceResource } from '@/rtk/features/singleRights/singleRightsApi';

import { useRestoreFocusTarget } from '../RestoreFocus';

import type { ClientResourceListItemData } from './ClientResourceListItems';

type DelegateHandler = (
  onSuccess?: () => void,
  onError?: (error?: ActionError) => void,
) => void | Promise<void>;

// DOM id for an item's inline action button, usable as a RestoreFocus target distinct from the item.
export const clientActionControlId = (itemId: string) => `list-action-${itemId}`;

export const restoreFocusOnSuccess = (
  handler: DelegateHandler | undefined,
  requestFocus: () => void,
): DelegateHandler | undefined =>
  handler &&
  ((onSuccess, onError) =>
    handler(() => {
      requestFocus();
      onSuccess?.();
    }, onError));

interface DelegationControlProps {
  id: string;
  name: string;
  hasAccess: boolean;
  disabled: boolean;
  onAction: DelegateHandler;
}

// Stays rendered and enabled while its own action runs, so focus is never lost to <body>.
const DelegationControl = ({ id, name, hasAccess, disabled, onAction }: DelegationControlProps) => {
  const { t } = useTranslation();
  const [isLoading, setIsLoading] = useState(false);
  useRestoreFocusTarget(id);

  const onClick = () => {
    if (isLoading) return;
    setIsLoading(true);
    void Promise.resolve(onAction()).finally(() => setIsLoading(false));
  };

  return (
    <Button
      id={id}
      variant='tertiary'
      disabled={disabled && !isLoading}
      onClick={onClick}
      aria-label={t(hasAccess ? 'common.delete_poa_for' : 'common.give_poa_for', {
        poa_object: name,
      })}
    >
      {isLoading ? (
        <DsSpinner
          aria-label={t('common.loading')}
          data-size='sm'
        />
      ) : hasAccess ? (
        <>
          <MinusCircleIcon aria-hidden='true' />
          {t('common.delete_poa')}
        </>
      ) : (
        <>
          <PlusCircleIcon aria-hidden='true' />
          {t('common.give_poa')}
        </>
      )}
    </Button>
  );
};

export type BuildPackageItemOptions = {
  id: string;
  accessPackage: AccessPackage | undefined;
  packageName: string;
  hasAccess: boolean;
  showAction: boolean;
  isMobileOrSmaller: boolean;
  addDisabled: boolean;
  removeDisabled: boolean;
  onDelegate: DelegateHandler | undefined;
  onRevoke: DelegateHandler | undefined;
  onOpenModal: (() => void) | undefined;
  t: TFunction;
};

type DelegationControlOptions = Pick<
  BuildPackageItemOptions,
  | 'id'
  | 'isMobileOrSmaller'
  | 'showAction'
  | 'hasAccess'
  | 'addDisabled'
  | 'removeDisabled'
  | 'onDelegate'
  | 'onRevoke'
> & { name: string };

const buildDelegationControl = ({
  id,
  name,
  isMobileOrSmaller,
  showAction,
  hasAccess,
  addDisabled,
  removeDisabled,
  onDelegate,
  onRevoke,
}: DelegationControlOptions): React.ReactNode => {
  const onAction = hasAccess ? onRevoke : onDelegate;
  if (isMobileOrSmaller || !showAction || !onAction) {
    return undefined;
  }
  return (
    <DelegationControl
      id={clientActionControlId(id)}
      name={name}
      hasAccess={hasAccess}
      disabled={hasAccess ? removeDisabled : addDisabled}
      onAction={onAction}
    />
  );
};

export const buildPackageItem = ({
  id,
  accessPackage,
  packageName,
  hasAccess,
  showAction,
  isMobileOrSmaller,
  addDisabled,
  removeDisabled,
  onDelegate,
  onRevoke,
  onOpenModal,
  t,
}: BuildPackageItemOptions): AccessPackageListItemProps => {
  const packageCount = t('access_packages.package_number_of_resources', {
    count: accessPackage?.resources?.length ?? 0,
  });

  const showModalTrigger = showAction && !!accessPackage && !!onOpenModal;
  const controls = buildDelegationControl({
    id,
    name: packageName,
    isMobileOrSmaller,
    showAction,
    hasAccess,
    addDisabled,
    removeDisabled,
    onDelegate,
    onRevoke,
  });

  return {
    id,
    name: packageName,
    interactive: showModalTrigger,
    as: showModalTrigger ? 'button' : 'div',
    titleAs: 'div',
    description: packageCount,
    color: hasAccess ? 'company' : 'neutral',
    onClick: showModalTrigger ? onOpenModal : undefined,
    controls,
  };
};

export type BuildResourceItemOptions = {
  id: string;
  resource: ServiceResource;
  hasAccess: boolean;
  showAction: boolean;
  isMobileOrSmaller: boolean;
  addDisabled: boolean;
  removeDisabled: boolean;
  onDelegate: DelegateHandler | undefined;
  onRevoke: DelegateHandler | undefined;
  onOpenModal: () => void;
};

export const buildResourceItem = ({
  id,
  resource,
  hasAccess,
  showAction,
  isMobileOrSmaller,
  addDisabled,
  removeDisabled,
  onDelegate,
  onRevoke,
  onOpenModal,
}: BuildResourceItemOptions): ClientResourceListItemData => {
  const controls = buildDelegationControl({
    id,
    name: resource.title,
    isMobileOrSmaller,
    showAction,
    hasAccess,
    addDisabled,
    removeDisabled,
    onDelegate,
    onRevoke,
  });

  return {
    id,
    resource,
    hasAccess,
    titleAs: 'div',
    controls,
    onClick: onOpenModal,
  };
};
