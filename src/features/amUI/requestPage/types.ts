export interface Request {
  id: string;
  type: 'consent' | 'systemuser' | 'agentsystemuser' | 'accessrequest';
  createdDate: string;
  displayPartyName: string;
  displayPartyType: 'person' | 'company' | 'system';
  description?: string;
  numberOfRequests?: number;
}
