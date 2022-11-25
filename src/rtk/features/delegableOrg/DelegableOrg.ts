export class DelegableOrg {
  id: string;
  orgName: string;
  orgNr: string;
  description: string;
  constructor(id: string, orgName: string, orgNr: string, description: string) {
    this.id = id;
    this.orgName = orgName;
    this.orgNr = orgNr;
    this.description = description;
  }
}
