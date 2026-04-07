export interface Request {
  id: string;
  type: 'consent' | 'systemuser' | 'agentsystemuser' | 'accessrequest';
  createdDate: string;
  displayPartyName: string;
  displayPartyType: 'person' | 'company' | 'system';
  isSubUnit?: boolean;
  partyUuid?: string;
  description?: string;
  numberOfRequests?: number;
}

export type ProcessedStatus = 'approved' | 'rejected';
