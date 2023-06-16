export interface DelegationInputDto {
  to: {
    Id: string;
    Value: string;
  };
  resource: Array<{
    Id: string;
    Value: string;
  }>;
}
