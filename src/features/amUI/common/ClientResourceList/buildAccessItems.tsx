import React from 'react';
import type { TFunction } from 'i18next';
import { Button, type AccessPackageListItemProps, type Color } from '@altinn/altinn-components';
import { MinusCircleIcon, PlusCircleIcon } from '@navikt/aksel-icons';

import type { ClientResourceListItemData } from './ClientResourceListItems';

import type { AccessPackage } from '@/rtk/features/accessPackageApi';
import type { ActionError } from '@/resources/hooks/useActionError';
import type { ServiceResource } from '@/rtk/features/singleRights/singleRightsApi';

type DelegateHandler = (
  onSuccess?: () => void,
  onError?: (error?: ActionError) => void,
) => void | Promise<void>;

export type BuildPackageItemOptions = {
  pkg: { id: string; urn?: string; name: string };
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

type DelegationControlsOptions = Pick<
  BuildPackageItemOptions,
  | 'isMobileOrSmaller'
  | 'showAction'
  | 'hasAccess'
  | 'addDisabled'
  | 'removeDisabled'
  | 'onDelegate'
  | 'onRevoke'
  | 't'
>;

const buildDelegationControls = ({
  isMobileOrSmaller,
  showAction,
  hasAccess,
  addDisabled,
  removeDisabled,
  onDelegate,
  onRevoke,
  t,
}: DelegationControlsOptions): React.ReactNode => {
  if (!isMobileOrSmaller && showAction && hasAccess && onRevoke) {
    return (
      <Button
        variant='tertiary'
        disabled={removeDisabled}
        onClick={() => onRevoke()}
      >
        <MinusCircleIcon aria-hidden='true' />
        {t('common.delete_poa')}
      </Button>
    );
  }
  if (!isMobileOrSmaller && showAction && !hasAccess && onDelegate) {
    return (
      <Button
        variant='tertiary'
        disabled={addDisabled}
        onClick={() => onDelegate()}
      >
        <PlusCircleIcon aria-hidden='true' />
        {t('common.give_poa')}
      </Button>
    );
  }
  return undefined;
};

export const buildPackageItem = ({
  pkg,
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
  const controls = buildDelegationControls({
    isMobileOrSmaller,
    showAction,
    hasAccess,
    addDisabled,
    removeDisabled,
    onDelegate,
    onRevoke,
    t,
  });

  return {
    id: pkg.id,
    name: packageName,
    interactive: showModalTrigger,
    as: showModalTrigger ? 'button' : 'div',
    titleAs: 'div',
    description: packageCount,
    color: (hasAccess ? 'company' : 'neutral') as Color,
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
  t: TFunction;
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
  t,
}: BuildResourceItemOptions): ClientResourceListItemData => {
  const controls = buildDelegationControls({
    isMobileOrSmaller,
    showAction,
    hasAccess,
    addDisabled,
    removeDisabled,
    onDelegate,
    onRevoke,
    t,
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
