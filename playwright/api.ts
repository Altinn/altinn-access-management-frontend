export class Api {
  async getToken(): Promise<string> {
    const env = process.env.ENV_NAME!;
    const tokenGeneratorUrl = process.env.TEST_TOKEN_GENERATOR_URL!;
    const user = process.env.TEST_TOKEN_GENERATOR_USER!;
    const pass = process.env.TEST_TOKEN_GENERATOR_PASS!;

    const url = `${tokenGeneratorUrl}GetEnterpriseToken?env=${encodeURIComponent(env)}&scopes=altinn:resourceregistry/resource.admin,altinn:register/partylookup.admin&org=digdir&orgNo=991825827&ttl=200000000`;
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
