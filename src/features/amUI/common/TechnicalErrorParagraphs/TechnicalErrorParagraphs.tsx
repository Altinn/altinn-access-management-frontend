import type { ParagraphProps } from '@digdir/designsystemet-react';
import { Paragraph } from '@digdir/designsystemet-react';
import React from 'react';
import { useTranslation } from 'react-i18next';

export interface TechnicalErrorParagraphsProps {
  /*** The http status of the error */
  status: string;
  /*** The http status of the error */
  time: string;
  /*** The size of the paragraph text */
  size?: ParagraphProps['size'];
}

export const TechnicalErrorParagraphs = ({
  status,
  time,
  size = 'sm',
}: TechnicalErrorParagraphsProps) => {
  const { t } = useTranslation();
  return (
    <>
      <Paragraph
        size={size}
        variant='long'
      >
        {t('common.technical_error')}
      </Paragraph>
      <Paragraph size={size}>
        {t('common.time_of_error', {
          time: new Date(time).toLocaleDateString('nb-NO', {
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
          }),
        })}
      </Paragraph>
      <Paragraph size={size}>
        {t('common.error_status', {
          status: status,
        })}
      </Paragraph>
    </>
  );
};
