import { DsAlert, DsHeading } from '@altinn/altinn-components';

import { TechnicalErrorParagraphs } from '../common/TechnicalErrorParagraphs';

export interface RequestErrorAlertProps {
  heading: string;
  details?: { status: string; time: string; traceId?: string } | null;
}

export const RequestErrorAlert = ({ heading, details }: RequestErrorAlertProps) => (
  <DsAlert
    role='alert'
    data-color='danger'
    data-size='sm'
  >
    <DsHeading
      level={2}
      data-size='2xs'
    >
      {heading}
    </DsHeading>
    {details && (
      <TechnicalErrorParagraphs
        size='xs'
        status={details.status}
        time={details.time}
        traceId={details.traceId}
      />
    )}
  </DsAlert>
);
