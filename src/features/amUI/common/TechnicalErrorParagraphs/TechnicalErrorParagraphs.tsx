import { Paragraph } from '@digdir/designsystemet-react';
import React from 'react';
import { useTranslation } from 'react-i18next';

export interface TechnicalErrorParagraphsProps {
  /*** The http status of the error */
  status: string;
  /*** The http status of the error */
  time: string;
}

export const TechnicalErrorParagraphs = ({ status, time }: TechnicalErrorParagraphsProps) => {
  const { t } = useTranslation();
  return (
    <>
      <Paragraph
        size='sm'
        variant='long'
      >
        {t('common.technical_error')}
      </Paragraph>
      <Paragraph size='sm'>
        {t('common.time_of_error', {
          time: new Date(time).toLocaleDateString('nb-NO', {
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
          }),
        })}
      </Paragraph>
      <Paragraph size='sm'>
        {t('common.error_status', {
          status: status,
        })}
      </Paragraph>
    </>
  );
};
