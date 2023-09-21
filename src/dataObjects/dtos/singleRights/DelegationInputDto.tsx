export enum ReduxStatusResponse {
  Fulfilled = 'fulfilled',
  Rejected = 'rejected',
}

export interface DelegationInputDto {
  To: IdValuePair[];
  Rights: DelegationRequestDto[];
  serviceDto: ServiceDto;
  status?: ReduxStatusResponse;
}

export class ServiceDto {
  serviceTitle: string;
  serviceOwner: string;

  constructor(serviceTitle: string, serviceOwner: string) {
    this.serviceTitle = serviceTitle;
    this.serviceOwner = serviceOwner;
  }
}

export class IdValuePair {
  id: string;
  value: string;

  constructor(id: string, value: string) {
    this.id = id;
    this.value = value;
  }
}

export class DelegationRequestDto {
  Resource: IdValuePair[];
  Action: string;

  constructor(resourceId: string, resourceValue: string, action: string) {
    this.Resource = [{ id: resourceId, value: resourceValue }];
    this.Action = action;
  }
}