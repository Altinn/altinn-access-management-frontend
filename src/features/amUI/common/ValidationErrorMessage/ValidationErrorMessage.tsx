import type { DsParagraphProps } from '@altinn/altinn-components';
import { DsParagraph } from '@altinn/altinn-components';
import React from 'react';
import { Trans } from 'react-i18next';

const supportedErrorCodes = ['AM.VLD-00002'];

export interface ValidationErrorMessageProps {
  /*** The error code returned from backend */
  errorCode: string;
  /*** The size of the paragraph text */
  size?: DsParagraphProps['data-size'];
}

export const ValidationErrorMessage = ({ size = 'sm', errorCode }: ValidationErrorMessageProps) => {
  const isSupported = supportedErrorCodes.includes(errorCode);
  const key = isSupported ? errorCode : 'default';

  return (
    <DsParagraph
      data-size={size}
      variant='long'
    >
      <Trans i18nKey={`delegation_modal.validation_error.${key}`} />
    </DsParagraph>
  );
};
