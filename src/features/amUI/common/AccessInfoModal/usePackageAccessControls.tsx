import React, { useState } from 'react';
import { Button, type AccessPackageListItemProps } from '@altinn/altinn-components';
import { MinusCircleIcon, PlusCircleIcon } from '@navikt/aksel-icons';
import { useTranslation } from 'react-i18next';

import type { AccessPackage } from '@/rtk/features/accessPackageApi';
import { useIsMobileOrSmaller } from '@/resources/utils/screensizeUtils';

import { AccessInfoModal } from './AccessInfoModal';
import { PackageHeader } from '../DelegationModal/AccessPackages/PackageHeader';
import { PackageMeta } from '../DelegationModal/AccessPackages/PackageMeta';

export interface PackageAccessAction {
  /** Access package name – shown as the list item title and modal heading. */
  packageName: string;
  /** Full package, used to render description + resources in the modal. */
  accessPackage?: AccessPackage;
  /** Party the access applies to (agent or client) – used in the status message. */
  toPartyName: string;
  hasAccess: boolean;
  /** Whether an add/remove action is available for this package. */
  canAct: boolean;
  isViaRole: boolean;
  roleName: string;
  addDisabled: boolean;
  removeDisabled: boolean;
  onAdd: () => void;
  onRemove: () => void;
}

type ItemActionProps = Pick<
  AccessPackageListItemProps,
  'interactive' | 'as' | 'onClick' | 'controls'
>;

/**
 * Shared behaviour for access-package rows that can delegate/remove a package.
 * On small screens the inline button is hidden and the row opens a modal showing
 * the package info (header, access status, description + resources) with a
 * clearly labelled action; on larger screens the inline button is shown.
 *
 * Reuses `AccessInfoModal`, `StatusSection`, `PackageHeader` and `PackageMeta`
 * so the modal mirrors the delegation flow's package info.
 */
export const usePackageAccessControls = () => {
  const { t } = useTranslation();
  const isMobileOrSmaller = useIsMobileOrSmaller();
  const [selected, setSelected] = useState<PackageAccessAction | null>(null);

  const runAction = (item: PackageAccessAction) => {
    if (item.hasAccess) {
      item.onRemove();
    } else {
      item.onAdd();
    }
  };

  const renderActionButton = (item: PackageAccessAction, onComplete?: () => void) => (
    <Button
      variant='tertiary'
      disabled={item.hasAccess ? item.removeDisabled : item.addDisabled}
      onClick={(e) => {
        // Prevent the row's click handler (which opens the modal) from firing
        // when the inline action button is used directly.
        e.stopPropagation();
        runAction(item);
        onComplete?.();
      }}
    >
      {item.hasAccess ? (
        <MinusCircleIcon aria-hidden='true' />
      ) : (
        <PlusCircleIcon aria-hidden='true' />
      )}
      {item.hasAccess
        ? t('client_administration_page.remove_package_button')
        : t('client_administration_page.delegate_package_button')}
    </Button>
  );

  /**
   * Spread onto an AccessPackageListItem. The row is always clickable to open
   * the package info modal; the inline action button is shown on larger screens
   * (and hidden on small screens, where the modal is the way to act).
   */
  const getItemActionProps = (item: PackageAccessAction): ItemActionProps => ({
    interactive: true,
    as: 'button',
    onClick: () => setSelected(item),
    controls: item.canAct && !isMobileOrSmaller ? renderActionButton(item) : undefined,
  });

  const modal = (
    <AccessInfoModal
      open={selected !== null}
      onClose={() => setSelected(null)}
      name={selected?.packageName ?? ''}
      header={selected ? <PackageHeader name={selected.packageName} /> : undefined}
      description={
        selected?.isViaRole
          ? t('client_administration_page.via_role', { role: selected.roleName })
          : undefined
      }
      userHasAccess={selected?.hasAccess}
      toPartyName={selected?.toPartyName}
      actions={selected?.canAct ? renderActionButton(selected, () => setSelected(null)) : null}
    >
      {selected?.accessPackage && <PackageMeta accessPackage={selected.accessPackage} />}
    </AccessInfoModal>
  );

  return { getItemActionProps, modal };
};
