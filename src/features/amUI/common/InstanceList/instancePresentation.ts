import type { TFunction } from 'i18next';

import { getAfUrl } from '@/resources/utils/pathUtils';
import type {
  DelegationInstance,
  DialogLookup,
  InstanceDelegation,
} from '@/rtk/features/instanceApi';
import type { ServiceResource } from '@/rtk/features/singleRights/singleRightsApi';

import { enableDialogportenDialogLookup } from '@/resources/utils/featureFlagUtils';

export interface InstancePresentationData {
  instance: DelegationInstance;
  dialogLookup?: DialogLookup | null;
}

export const isCorrespondenceInstanceUrn = (instanceUrn: string | undefined): boolean =>
  instanceUrn?.startsWith('urn:altinn:correspondence-id:') ?? false;

export const getInstanceShortId = (instanceUrn: string | undefined): string | undefined =>
  instanceUrn?.slice(-10);

export const getDialogTitle = (
  dialogLookup: DialogLookup | null | undefined,
  language: string,
): string | undefined => {
  if (dialogLookup?.status !== 'Success' || !dialogLookup.title?.length) {
    return undefined;
  }

  const langCode = language.replace('no_', '');
  return (
    dialogLookup.title.find((title) => title.languageCode === langCode)?.value ??
    dialogLookup.title[0].value
  );
};

export const resolveInstanceTitle = (
  instanceData: InstancePresentationData | undefined,
  resource: ServiceResource | undefined,
  t: TFunction,
  language: string,
): string => {
  const dialogLookup = instanceData?.dialogLookup;
  const instanceUrn = instanceData?.instance.refId;
  const dialogTitle = getDialogTitle(dialogLookup, language);
  if (dialogTitle) {
    return dialogTitle;
  }

  if (dialogLookup?.status === 'Forbidden') {
    return t('instance_header.title_forbidden');
  }

  if (dialogLookup?.status === 'NotFound' && isCorrespondenceInstanceUrn(instanceUrn)) {
    const resourceName = resource?.title ?? resource?.identifier;
    if (!resourceName) {
      return t('instance_header.title_not_found');
    }

    return t('instance_header.title_correspondence_not_found', {
      resourceName,
    });
  }

  if (dialogLookup?.status === 'NotFound') {
    return t('instance_header.title_not_found');
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
  const dialoglookupEnabled = enableDialogportenDialogLookup();

  const isInboxDeepLink = !!dialogId;

  const showInboxLink =
    isInboxDeepLink ||
    !isCorrespondenceInstanceUrn(instanceUrn) ||
    (dialoglookupEnabled && dialogLookup?.status === 'Success');

  const href = !!dialogId
    ? `${getAfUrl()}inbox/${encodeURIComponent(dialogId)}`
    : `${getAfUrl()}redirect?instanceUrn=${encodeURIComponent(instanceUrn)}`;

  return {
    href,
    isInboxDeepLink,
    showInboxLink,
  };
};

export const toInstancePresentationData = (
  instanceDelegation: Pick<InstanceDelegation, 'instance' | 'dialogLookup'>,
): InstancePresentationData => ({
  instance: instanceDelegation.instance,
  dialogLookup: instanceDelegation.dialogLookup,
});
