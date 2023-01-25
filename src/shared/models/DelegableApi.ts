export class DelegableApi {
  id: string;
  apiName: string;
  orgName: string;
  rightsDescription: string;
  description?: string;
  scopes?: [];
  constructor(
    id: string,
    apiName: string,
    orgName: string,
    rightsDescription: string,
    scopes: [],
    description?: string,
  ) {
    this.id = id;
    this.apiName = apiName;
    this.orgName = orgName;
    this.description = description;
    this.rightsDescription = rightsDescription;
    this.scopes = scopes;
  }
}
