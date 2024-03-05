import * as React from 'react';
import { Button } from '@digdir/design-system-react';
import { MinusCircleIcon } from '@navikt/aksel-icons';
import { useTranslation } from 'react-i18next';

import type { CollectionBarProps } from '@/components';
import { ActionBar, CollectionBar } from '@/components';
import { type ServiceResource } from '@/rtk/features/singleRights/singleRightsApi';

export interface ResourceCollectionBarProps
  extends Pick<CollectionBarProps, 'proceedToPath' | 'compact'> {
  /** The resources that are to appear in the CollectionBar content */
  resources: ServiceResource[];
  /** The callback function to be called when the remove button is pressed on a resource. */
  onRemove: (identifier: string) => void;
}

/**
 * This component renders a CollectionBar and populates its content with resources, rendered as removable ActionBars.
 * Colors and text is handled automatically inside the component
 *
 * @component
 * @param {ServiceResource[]} props.resources - The resources that are to appear in the CollectionBar content.
 * @param {boolean} props.compact - Whether or not to use the CollectionBar's compact mode.
 * @param {function} props.onRemove - The callback function to be called when the remove button is pressed on a resource.
 * @param {string} props.proceedToPath - The path to proceed to.
 * @returns {JSX.Element} The rendered ResourceCollectionBar component.
 *
 * @example
 * <ResourceCollectionBar
 *   resources={[{ title: 'Resource 1', resourceOwnerName: 'Owner 1', identifier: 'appid-101' }]}
 *   compact={false}
 *   onRemove={(identifier) => handleRemoveResource(identifier)}
 *   proceedToPath="/next-page"
 * />
 */
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
          variant='tertiary'
          size={compact ? 'medium' : 'small'}
          onClick={() => {
            onRemove(resource.identifier);
          }}
          icon={compact}
        >
          {!compact ? t('common.remove') : <MinusCircleIcon title={t('common.remove')} />}
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
      disabledProceedButton={resources.length < 1}
    />
  );
};
