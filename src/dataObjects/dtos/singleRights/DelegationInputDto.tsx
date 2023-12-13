import type { IdValuePair } from '../IdValuePair';

export interface DelegationInputDto {
  To: IdValuePair[];
  Rights: DelegationRequestDto[];
  serviceDto: ServiceDto;
}

export class ServiceDto {
  serviceTitle: string;
  serviceOwner: string;

  constructor(serviceTitle: string, serviceOwner: string) {
    this.serviceTitle = serviceTitle;
    this.serviceOwner = serviceOwner;
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
