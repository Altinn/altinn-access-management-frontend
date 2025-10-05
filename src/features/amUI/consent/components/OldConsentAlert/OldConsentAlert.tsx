import { getHostUrl } from '@/resources/utils/pathUtils';
import { DsAlert, DsHeading, DsLink, DsParagraph } from '@altinn/altinn-components';
import { Trans } from 'react-i18next';
import classes from './OldConsentAlert.module.css';

interface OldConsentAlertProps {
  heading: string;
  text: string;
}

export const OldConsentAlert = ({ heading, text }: OldConsentAlertProps) => {
  return (
    <DsAlert className={classes.consentAlert}>
      <DsHeading
        data-size='xs'
        level={2}
      >
        {heading}
      </DsHeading>
      <DsParagraph>
        <Trans
          i18nKey={text}
          components={{
            //@ts-ignore children is required in DsLink, but children will be set from <Trans>
            a: <DsLink href={`${getHostUrl()}ui/profile/`} />,
          }}
        />
      </DsParagraph>
    </DsAlert>
  );
};
