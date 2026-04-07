import type { TFunction } from 'i18next';
import type { DialogLookup } from '@/rtk/features/instanceApi';
import type { ServiceResource } from '@/rtk/features/singleRights/singleRightsApi';

/** Pick the localized title from a dialog lookup, preferring the current language. */
export const getDialogTitle = (
  dialogLookup: DialogLookup | null | undefined,
  language: string,
): string | undefined => {
  if (dialogLookup?.status !== 'Success' || !dialogLookup.title?.length) {
    return undefined;
  }
  // Dialogporten uses short codes (nb, nn, en); i18n uses no_nb / no_nn
  const langCode = language.replace('no_', '');
  return (
    dialogLookup.title.find((t) => t.languageCode === langCode)?.value ??
    dialogLookup.title[0].value
  );
};

/**
 * Resolves the display title for an instance delegation.
 * Uses the dialog lookup title when available, falling back to status-based
 * or resource-based text depending on what we know about the instance.
 */
export const resolveInstanceTitle = (
  dialogLookup: DialogLookup | null | undefined,
  resource: ServiceResource | undefined,
  instanceRefId: string | undefined,
  t: TFunction,
  language: string,
): string => {
  const dialogTitle = getDialogTitle(dialogLookup, language);
  if (dialogTitle) {
    return dialogTitle;
  }

  if (dialogLookup?.status === 'Forbidden') {
    return t('instance_header.title_forbidden');
  }

  const isCorrespondence = instanceRefId?.startsWith('urn:altinn:correspondence-id:');
  if (dialogLookup?.status === 'NotFound' && isCorrespondence) {
    return t('instance_header.title_correspondence_not_found', {
      resourceName: resource?.title ?? resource?.identifier,
    });
  }
  if (dialogLookup?.status === 'NotFound') {
    return t('instance_header.title_not_found');
  }

  return resource?.title ?? resource?.identifier ?? '';
};
