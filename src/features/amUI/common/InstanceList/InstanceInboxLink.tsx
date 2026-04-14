import { Button, DsButton } from '@altinn/altinn-components';
import { EnvelopeClosedIcon } from '@navikt/aksel-icons';
import { useTranslation } from 'react-i18next';

import type { InstanceDelegation } from '@/rtk/features/instanceApi';

import { getInboxLinkData } from './instanceListUtils';

interface InstanceInboxLinkProps {
  instance: Pick<InstanceDelegation, 'instance' | 'dialogLookup'>;
  isLarge?: boolean;
}

export const InstanceInboxLink = ({ instance, isLarge = false }: InstanceInboxLinkProps) => {
  const { t } = useTranslation();
  const { href, showInboxLink } = getInboxLinkData({
    instanceUrn: instance.instance.refId,
    dialogLookup: instance.dialogLookup ?? undefined,
    dialogId: instance.dialogLookup?.dialogId,
  });

  if (!showInboxLink) {
    return null;
  }

  if (isLarge) {
    return (
      <DsButton
        asChild
        variant='secondary'
      >
        <a href={href}>
          <EnvelopeClosedIcon aria-hidden />
          {t('instance_detail_page.see_in_inbox')}
        </a>
      </DsButton>
    );
  }

  return (
    <Button
      variant='tertiary'
      rounded
      size='xs'
      as='a'
      href={href}
    >
      <EnvelopeClosedIcon aria-hidden /> {t('instance_detail_page.see_in_inbox')}
    </Button>
  );
};
