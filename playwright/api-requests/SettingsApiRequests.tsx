import { Token } from './Token';
import { env } from 'playwright/util/helper';

export class SettingsApiRequests {
  private tokenClass: Token;

  constructor() {
    this.tokenClass = new Token();
  }

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
    const token = await this.tokenClass.getPersonalTokenByPid(pid);
    // The settings endpoint lives on the app host (BASE_URL origin), not the
    // platform host (API_BASE_URL): e.g. https://am.ui.tt02.altinn.no/...
    const appOrigin = new URL(env('BASE_URL')).origin;
    const url = `${appOrigin}/accessmanagement/api/v1/settings/language/selectedLanguage`;
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ languageCode }),
    });

    if (!response.ok) {
      throw new Error(
        `Failed to set selectedLanguage=${languageCode} for "${pid}". Status: ${response.status}`,
      );
    }
  }
}
