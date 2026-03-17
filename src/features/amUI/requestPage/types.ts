export interface Request {
  id: string;
  type: 'consent' | 'systemuser' | 'agentsystemuser' | 'accessrequest';
  createdDate: string;
  fromPartyName: string;
  fromPartyType: 'person' | 'company' | 'system';
  description?: string;
  toPartyName?: string;
  toPartyType?: 'person' | 'company' | 'system';
  numberOfRequests?: number;
}
