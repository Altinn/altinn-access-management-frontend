import * as React from 'react';
import { Button } from '@digdir/design-system-react';
import { MinusCircleIcon } from '@navikt/aksel-icons';
import { useTranslation } from 'react-i18next';

import type { CollectionBarProps } from '@/components';
import { ActionBar, CollectionBar } from '@/components';
import { type ServiceResource } from '@/rtk/features/singleRights/singleRightsApi';

export interface ResourceCollectionBarProps extends Pick<CollectionBarProps, 'proceedToPath'> {
  /** The resources that are to appear in the CollectionBar content */
  resources: ServiceResource[];
  /** Whether or not to use the CollectionBars compact mode */
  compact: boolean;
  /** The callback function to be called when the remove button is pressed on a resource. */
  onRemove: (identifier: string) => void;
}

export const ResourceCollectionBar = ({
  resources = [],
  proceedToPath,
  onRemove,
  compact = false,
}: ResourceCollectionBarProps) => {
  const { t } = useTranslation('common');

  const selectedResourcesActionBars = resources.map((resource, index) => (
    <ActionBar
      key={index}
      title={resource.title}
      subtitle={resource.resourceOwnerName}
      size='small'
      color='success'
      actions={
        <Button
          variant='quiet'
          size={compact ? 'medium' : 'small'}
          onClick={() => {
            onRemove(resource.identifier);
          }}
          icon={compact && <MinusCircleIcon title={t('common.remove')} />}
        >
          {!compact && t('common.remove')}
        </Button>
      }
    ></ActionBar>
  ));

  return (
    <CollectionBar
      title={t('single_rights.chosen_services')}
      color={selectedResourcesActionBars.length > 0 ? 'success' : 'neutral'}
      collection={selectedResourcesActionBars}
      compact={compact}
      proceedToPath={proceedToPath}
    />
  );
};
