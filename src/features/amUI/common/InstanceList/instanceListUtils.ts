import type { TFunction } from 'i18next';

import { enableDialogportenDialogLookup } from '@/resources/utils/featureFlagUtils';
import { getAfUrl } from '@/resources/utils/pathUtils';
import type {
  DelegationInstance,
  DialogLookup,
  InstanceDelegation,
} from '@/rtk/features/instanceApi';
import type { ServiceResource } from '@/rtk/features/singleRights/singleRightsApi';

export interface InstancePresentationData {
  instance: DelegationInstance;
  dialogLookup?: DialogLookup;
}

export const isCorrespondenceInstanceUrn = (instanceUrn?: string): boolean =>
  instanceUrn?.startsWith('urn:altinn:correspondence-id:') ?? false;

export const getInstanceShortId = (instanceUrn?: string): string | undefined =>
  instanceUrn?.slice(-10);

export const getDialogTitle = (
  dialogLookup?: DialogLookup,
  language?: string,
): string | undefined => {
  if (dialogLookup?.status !== 'Success' || !dialogLookup.title?.length) {
    return undefined;
  }

  const langCode = language?.replace('no_', '');
  return (
    dialogLookup.title.find((title) => title.languageCode === langCode)?.value ??
    dialogLookup.title[0].value
  );
};

export const resolveInstanceTitle = (
  instanceData: InstancePresentationData | undefined,
  resource: ServiceResource | undefined,
  t: TFunction,
  language?: string,
): string => {
  const dialogLookup = instanceData?.dialogLookup;
  const instanceUrn = instanceData?.instance.refId;
  const dialogTitle = getDialogTitle(dialogLookup, language);

  if (dialogTitle) {
    return dialogTitle;
  }

  if (dialogLookup?.status === 'Forbidden') {
    return t('instance.title_forbidden');
  }

  if (dialogLookup?.status === 'NotFound' && isCorrespondenceInstanceUrn(instanceUrn)) {
    const resourceName = resource?.title ?? resource?.identifier;
    if (!resourceName) {
      return t('instance.title_not_found');
    }

    return t('instance.title_correspondence_not_found', { resourceName });
  }

  if (dialogLookup?.status === 'NotFound') {
    return t('instance.title_not_found');
  }

  return resource?.title ?? resource?.identifier ?? '';
};

export const getInboxLinkData = ({
  instanceUrn,
  dialogLookup,
  dialogId,
}: {
  instanceUrn: string;
  dialogLookup?: DialogLookup;
  dialogId?: string;
}) => {
  const dialogLookupEnabled = enableDialogportenDialogLookup();
  const href = `${getAfUrl()}redirect?instanceUrn=${encodeURIComponent(instanceUrn)}`;

  // Correspondence and deeplink should hide the inbox link.
  // When Dialogporten lookup is enabled, we require a successful lookup to show the inbox link.
  if (dialogId || isCorrespondenceInstanceUrn(instanceUrn)) {
    return {
      showInboxLink: false,
    };
  }

  if (!dialogLookupEnabled) {
    return {
      href,
      showInboxLink: true,
    };
  }

  return {
    href,
    showInboxLink: dialogLookup?.status === 'Success',
  };
};

export const toInstancePresentationData = (
  instanceDelegation: Pick<InstanceDelegation, 'instance' | 'dialogLookup'>,
): InstancePresentationData => ({
  instance: instanceDelegation.instance,
  dialogLookup: instanceDelegation.dialogLookup,
});
