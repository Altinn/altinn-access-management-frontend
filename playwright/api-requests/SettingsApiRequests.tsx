import { asUser } from './callAs';
import { ApiError, appUrl, type HttpMethod } from './apiRequest';

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
   * Note that this throws for an organisation that has no addresses registered:
   * the endpoint answers 500 rather than an empty list in that case. Use
   * `setNotificationAddresses` for setup, which handles it.
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
   * Two quirks of the endpoint are handled here so specs don't have to:
   *  - Listing an organisation that has NO addresses answers 500, not an empty
   *    list. POST works regardless, so the first wanted address is seeded before
   *    the list is read, which also makes any fresh test organisation usable.
   *  - The desired state must contain at least one address, for the 409 above.
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

    const existing = await this.readOrSeedAddresses(pid, orgNumber, { emails, phones });

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
   * Reads the organisation's addresses, seeding one first if the list cannot be
   * read because the organisation has none.
   *
   * Listing answers 500 for an organisation with no registered addresses, while
   * POST works — so in that one case a wanted address is created and the list is
   * read again. The re-read is what gets returned, so the caller's diff sees the
   * seeded address and does not add it a second time.
   *
   * Only that specific 500 is treated as "empty". Anything else — 401/403, a
   * misconfigured BASE_URL, a network failure — is rethrown, so a real problem
   * surfaces instead of being hidden behind a write. A genuinely transient 500
   * would still be read as empty; that is the closest signal the endpoint gives.
   */
  private async readOrSeedAddresses(
    pid: string,
    orgNumber: string,
    { emails, phones }: { emails: string[]; phones: { countryCode: string; phone: string }[] },
  ): Promise<NotificationAddress[]> {
    try {
      return await this.getNotificationAddresses(pid, orgNumber);
    } catch (error) {
      if (!(error instanceof ApiError) || error.status !== 500) {
        throw error;
      }

      if (emails.length > 0) {
        await this.addEmailNotificationAddress(pid, orgNumber, emails[0]);
      } else {
        await this.addSmsNotificationAddress(
          pid,
          orgNumber,
          phones[0].countryCode,
          phones[0].phone,
        );
      }
      return await this.getNotificationAddresses(pid, orgNumber);
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
