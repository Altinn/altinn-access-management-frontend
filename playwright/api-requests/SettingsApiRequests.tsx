import { asUser } from './callAs';
import { appUrl, type HttpMethod } from './apiRequest';

/**
 * A notification address as returned by the settings BFF. Email addresses have
 * `email` set and `phone` empty; SMS addresses the other way around.
 */
export interface NotificationAddress {
  notificationAddressId: number;
  email: string;
  phone: string;
  countryCode: string;
}

export class SettingsApiRequests {
  /**
   * Sets the user's UI language server-side (profile) using their enduser token.
   *
   * Call this BEFORE login: the app seeds the `selectedLanguage` cookie from the
   * profile at login, so setting the profile first makes the logged-in session
   * render in the desired language deterministically — regardless of the test
   * user's stored profile language.
   *
   * @param pid - PID of the user to set the language for (enduser token owner).
   * @param languageCode - e.g. 'no_nb' | 'no_nn' | 'en' (see LANGUAGE_CODE).
   */
  public async setSelectedLanguage(pid: string, languageCode: string): Promise<void> {
    await this.request(pid, 'POST', 'language/selectedLanguage', { languageCode });
  }

  /**
   * Lists the organisation's notification addresses (both email and SMS).
   *
   * @param pid - PID of a user who is company profile admin for the organisation.
   * @param orgNumber - The 9-digit organisation number.
   */
  public async getNotificationAddresses(
    pid: string,
    orgNumber: string,
  ): Promise<NotificationAddress[]> {
    const addresses = await this.request<NotificationAddress[]>(
      pid,
      'GET',
      `org/${orgNumber}/notificationaddresses`,
    );
    return addresses ?? [];
  }

  /**
   * Adds an email notification address for the organisation.
   *
   * @returns The created address, including the id needed to delete it again.
   */
  public async addEmailNotificationAddress(
    pid: string,
    orgNumber: string,
    email: string,
  ): Promise<NotificationAddress> {
    return this.request(pid, 'POST', `org/${orgNumber}/notificationaddresses`, {
      email,
      phone: '',
      countryCode: '',
    });
  }

  /**
   * Adds an SMS notification address for the organisation.
   *
   * @param countryCode - Country code including the plus sign, e.g. '+47'.
   * @param phone - Phone number without spaces.
   * @returns The created address, including the id needed to delete it again.
   */
  public async addSmsNotificationAddress(
    pid: string,
    orgNumber: string,
    countryCode: string,
    phone: string,
  ): Promise<NotificationAddress> {
    return this.request(pid, 'POST', `org/${orgNumber}/notificationaddresses`, {
      email: '',
      phone,
      countryCode,
    });
  }

  public async deleteNotificationAddress(
    pid: string,
    orgNumber: string,
    notificationAddressId: number,
  ): Promise<void> {
    await this.request(
      pid,
      'DELETE',
      `org/${orgNumber}/notificationaddresses/${notificationAddressId}`,
    );
  }

  /**
   * Puts the organisation's notification addresses into a known baseline state.
   *
   * Adds the wanted addresses first, then deletes everything that isn't wanted.
   * The order is not cosmetic — the API refuses (409) to delete an organisation's
   * last remaining address, so emptying the list first would break the call.
   *
   * The desired state must contain at least one address, for the 409 above.
   *
   * Use this in `beforeEach` so a test never inherits addresses left behind by a
   * previous run, and in `afterEach` to put the organisation back.
   *
   * @param emails - The email addresses the organisation should end up with.
   * @param phones - The SMS addresses the organisation should end up with.
   */
  public async setNotificationAddresses(
    pid: string,
    orgNumber: string,
    {
      emails = [],
      phones = [],
    }: { emails?: string[]; phones?: { countryCode: string; phone: string }[] },
  ): Promise<void> {
    if (emails.length === 0 && phones.length === 0) {
      throw new Error(
        `setNotificationAddresses("${orgNumber}") needs at least one email or phone: ` +
          `the API rejects deleting an organisation's last notification address.`,
      );
    }

    const existing = await this.getNotificationAddresses(pid, orgNumber);

    const missingEmails = emails.filter(
      (email) => !existing.some((address) => address.email === email),
    );
    for (const email of missingEmails) {
      await this.addEmailNotificationAddress(pid, orgNumber, email);
    }

    const missingPhones = phones.filter(
      (wanted) =>
        !existing.some(
          (address) => address.phone === wanted.phone && address.countryCode === wanted.countryCode,
        ),
    );
    for (const { countryCode, phone } of missingPhones) {
      await this.addSmsNotificationAddress(pid, orgNumber, countryCode, phone);
    }

    const unwanted = existing.filter((address) =>
      address.email
        ? !emails.includes(address.email)
        : !phones.some(
            (wanted) =>
              wanted.phone === address.phone && wanted.countryCode === address.countryCode,
          ),
    );
    for (const address of unwanted) {
      await this.deleteNotificationAddress(pid, orgNumber, address.notificationAddressId);
    }
  }

  /**
   * Issues an authenticated call against the settings BFF.
   *
   * The settings endpoints live on the app host (BASE_URL origin), not the
   * platform host (API_BASE_URL): e.g. https://am.ui.tt02.altinn.no/...
   */
  private request<T>(pid: string, method: HttpMethod, path: string, body?: unknown): Promise<T> {
    return asUser<T>(pid, method, appUrl(`accessmanagement/api/v1/settings/${path}`), body);
  }
}
