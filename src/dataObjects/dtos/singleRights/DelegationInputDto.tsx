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

export class IdValuePair {
  id: string;
  value?: string;

  constructor(id: string, value: string) {
    this.id = id;
    this.value = value;
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
