import type { IdValuePair } from './IdValuePair';

export type DelegationAccessResult = {
  rightKey: 'string';
  resource: IdValuePair[];
  action: string;
  status: string;
  details: details[];
};

type details = {
  code: string;
  description: string;
  parameters: IdValuePair;
};

export type DelegationResult = {
  from: IdValuePair;
  to: IdValuePair;
  rightDelegationResults: DelegationAccessResult[];
};
