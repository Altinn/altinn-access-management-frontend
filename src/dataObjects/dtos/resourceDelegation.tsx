import type { IdValuePair } from './IdValuePair';

export interface DelegationInputDto {
  To: IdValuePair[];
  Rights: DelegationRequestDto[];
  serviceDto: ServiceDto;
}

export class ServiceDto {
  serviceTitle: string;
  serviceOwner: string;
  serviceType: string;

  constructor(serviceTitle: string, serviceOwner: string, serviceType: string) {
    this.serviceTitle = serviceTitle;
    this.serviceOwner = serviceOwner;
    this.serviceType = serviceType;
  }
}

export class DelegationRequestDto {
  Resource: IdValuePair[];
  Action: string;

  constructor(resource: IdValuePair[], action: string) {
    this.Resource = resource;
    this.Action = action;
  }
}

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
  delegationResult: DelegationAccessResult[];
};

export type ApiDelegationResult = {
  orgNumber: string;
  orgName: string;
  apiId: string;
  apiName: string;
  success: boolean;
};

export type ResourceReference = {
  resource: IdValuePair[];
  action?: string;
};

export enum RightStatus {
  Delegable = 'Delegable',
  NotDelegable = 'NotDelegable',
}
