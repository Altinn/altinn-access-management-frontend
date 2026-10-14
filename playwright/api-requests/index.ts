import { AuthorizedParties } from './AuthorizedParties';
import { token } from './callAs';
import { ConsentApiRequests } from './ConsentApiRequests';
import { EnduserConnection } from './EnduserConnection';
import { MaskinportenApiRequests } from './MaskinportenApiRequests';
import { RequestApiRequests } from './RequestApiRequests';
import { SettingsApiRequests } from './SettingsApiRequests';
import { ApiRequests } from './SystemUserApiRequests';

/** All API clients for test-data setup and cleanup, handed to specs as the `api` fixture. */
export class ApiClient {
  readonly authorizedParties = new AuthorizedParties();
  readonly connections = new EnduserConnection();
  readonly consent = new ConsentApiRequests();
  readonly maskinporten = new MaskinportenApiRequests();
  readonly requests = new RequestApiRequests();
  readonly settings = new SettingsApiRequests();
  readonly systemUsers = new ApiRequests();
  readonly token = token;
}
