export interface Request {
  id: string;
  type: 'consent' | 'systemuser' | 'accessrequest';
  createdDate: string;
  fromPartyName: string;
  fromPartyType: 'person' | 'company';
  description: string;
}
