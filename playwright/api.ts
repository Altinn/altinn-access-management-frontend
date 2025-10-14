import { env } from 'playwright/util/helper';

export class Api {
  async getToken(): Promise<string> {
    const environment = env('ENV_NAME');
    const tokenGeneratorUrl = env('TEST_TOKEN_GENERATOR_URL');
    const user = env('TEST_TOKEN_GENERATOR_USER');
    const pass = env('TEST_TOKEN_GENERATOR_PASS');

    const url = `${tokenGeneratorUrl}GetEnterpriseToken?env=${encodeURIComponent(environment)}&scopes=altinn:resourceregistry/resource.admin,altinn:register/partylookup.admin&org=digdir&orgNo=991825827&ttl=200000000`;
    // const auth = btoa(`${user}:${pass}`);
    const Authorization = 'Basic ' + btoa(`${user}:${pass}`);

    const response = await fetch(url, {
      headers: {
        Authorization,
      },
    });

    const json = await response.text();
    return json;
  }
}
