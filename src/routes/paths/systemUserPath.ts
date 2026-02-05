export enum SystemUserPath {
  SystemUser = 'systemuser',
  Overview = 'overview',
  Create = 'create',
  Details = ':id',
  AgentDelegation = ':id/agentdelegation',
  Request = 'request',
  ChangeRequest = 'changerequest',
  AgentRequest = 'agentrequest',
}

export const getSystemUserRequestUrl = (requestId: string, backToPage: string) => {
  return `/${SystemUserPath.SystemUser}/${SystemUserPath.Request}?id=${requestId}&skiplogout=true&backtopage=${backToPage}`;
};

export const getSystemUserAgentRequestUrl = (requestId: string, backToPage: string) => {
  return `/${SystemUserPath.SystemUser}/${SystemUserPath.AgentRequest}?id=${requestId}&skiplogout=true&backtopage=${backToPage}`;
};
