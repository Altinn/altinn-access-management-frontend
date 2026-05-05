import React from 'react';
import { Trans, useTranslation } from 'react-i18next';
import { DsParagraph } from '@altinn/altinn-components';
import classes from './DraftRequestPage.module.css';

interface RequestReceiptBodyProps {
  bodyTextKey: string;
  toName: string;
}

export const RequestReceiptBody = ({ bodyTextKey, toName }: RequestReceiptBodyProps) => {
  const { t } = useTranslation();

  return (
    <>
      <DsParagraph>
        <Trans
          i18nKey={bodyTextKey}
          components={{ b: <strong /> }}
          values={{ to_name: toName }}
        />
      </DsParagraph>
      <DsParagraph className={classes.closeWindowInfo}>
        {t('draft_request_page.close_window_info')}
      </DsParagraph>
    </>
  );
};
