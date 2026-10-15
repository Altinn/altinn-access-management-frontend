import fs from 'fs';
import path from 'path';

import { token } from 'playwright/api-requests/callAs';
import { appUrl, platformUrl } from 'playwright/api-requests/apiRequest';
import { currentEnv, env } from 'playwright/util/helper';

/**
 * Varmer opp miljøet før testene starter.
 *
 * Den nattlige kjøringen 15.10 feilet bare de første ~6 minuttene, i både AT23
 * og TT02, og de samme testene besto på retry på 7–15 sekunder. Det ligner
 * kaldstart, så før workerne starter henter vi forsiden og JS/CSS-en den peker
 * på én gang, og går så gjennom testbrukerne én om gangen: henter token
 * (register-oppslag + token-generator), kaller BFF-en sin profil og aktørliste
 * (som går videre til authorizedparties) og authentication sin refresh. Bare
 * lesekall, ingen testdata opprettes.
 *
 * Testbrukerne er fødselsnumrene (11 siffer i anførselstegn) i testfilene, så
 * nye brukere blir med uten at noen må huske å legge dem til her.
 *
 * Kallene går rett på `fetch` med ett forsøk og kort timeout, ikke via `send`
 * og dens retries, så en treg bruker ikke holder igjen hele oppvarmingen. Feil
 * telles og logges, men stopper aldri suiten: oppvarmingen er ikke en test.
 *
 * Kun i CI, så lokale kjøringer ikke blir tregere (`OPPVARMING=true` for å
 * tvinge den på).
 */
const TESTMAPPER = ['e2eTests', 'uuTests'];
const KALL_TIMEOUT_MS = 20_000;

function finnTestbrukere(): string[] {
  const pids = new Set<string>();
  for (const mappe of TESTMAPPER) {
    const filer = fs.readdirSync(path.join(__dirname, mappe), {
      recursive: true,
      encoding: 'utf-8',
    });
    for (const fil of filer.filter((f) => f.endsWith('.ts'))) {
      const innhold = fs.readFileSync(path.join(__dirname, mappe, fil), 'utf-8');
      for (const [, pid] of innhold.matchAll(/['"`](\d{11})['"`]/g)) pids.add(pid);
    }
  }
  return [...pids];
}

const sekunder = (ms: number) => `${(ms / 1000).toFixed(1)}s`;

class Steg {
  ok = 0;
  feil = new Map<string, number>();
  totalMs = 0;
  tregestMs = 0;

  constructor(readonly navn: string) {}

  async kjør(kall: () => Promise<unknown>): Promise<boolean> {
    const start = Date.now();
    try {
      await kall();
      this.ok++;
      return true;
    } catch (error) {
      const årsak = error instanceof Error ? error.message.split('\n')[0].slice(0, 80) : 'ukjent';
      this.feil.set(årsak, (this.feil.get(årsak) ?? 0) + 1);
      return false;
    } finally {
      const ms = Date.now() - start;
      this.totalMs += ms;
      this.tregestMs = Math.max(this.tregestMs, ms);
    }
  }

  oppsummering(): string {
    const antall = this.ok + [...this.feil.values()].reduce((a, b) => a + b, 0);
    const snitt = antall ? this.totalMs / antall : 0;
    const feil = [...this.feil].map(([årsak, n]) => `\n    ${n} × ${årsak}`).join('');
    return (
      `  ${this.navn}: ${this.ok}/${antall} ok, snitt ${sekunder(snitt)}, ` +
      `tregest ${sekunder(this.tregestMs)}${feil}`
    );
  }
}

async function get(url: string, bearer: string): Promise<Response> {
  const response = await fetch(url, {
    headers: { Authorization: `Bearer ${bearer}` },
    signal: AbortSignal.timeout(KALL_TIMEOUT_MS),
  });
  if (!response.ok) throw new Error(`HTTP ${response.status}`);
  return response;
}

export default async function globalSetup(): Promise<void> {
  if (!process.env.CI && process.env.OPPVARMING !== 'true') return;

  const pids = finnTestbrukere();
  console.log(`Oppvarming av ${currentEnv()}: ${pids.length} testbrukere`);

  const forsideSteg = new Steg('forside + JS/CSS');
  const tokenSteg = new Steg('token');
  const profilSteg = new Steg('BFF user/profile');
  const aktoerlisteSteg = new Steg('BFF user/actorlist');
  const refreshSteg = new Steg('authentication/refresh');
  const profil = appUrl('accessmanagement/api/v1/user/profile');
  const aktoerliste = appUrl('accessmanagement/api/v1/user/actorlist/old');
  const refresh = platformUrl('authentication/api/v1/refresh');

  const start = Date.now();
  await forsideSteg.kjør(async () => {
    const bearer = await token.getPersonalTokenByPid(pids[0]);
    const html = await (await get(env('BASE_URL'), bearer)).text();
    const filer = [...html.matchAll(/(?:src|href)="(\/accessmanagement\/assets\/[^"]+)"/g)];
    await Promise.all(filer.map(([, fil]) => get(appUrl(fil), bearer)));
  });
  for (const pid of pids) {
    let bearer = '';
    const harToken = await tokenSteg.kjør(async () => {
      bearer = await token.getPersonalTokenByPid(pid);
    });
    if (!harToken) continue;
    await profilSteg.kjør(() => get(profil, bearer));
    await aktoerlisteSteg.kjør(() => get(aktoerliste, bearer));
    await refreshSteg.kjør(() => get(refresh, bearer));
  }

  console.log(
    [
      `Oppvarming ferdig på ${sekunder(Date.now() - start)}`,
      ...[forsideSteg, tokenSteg, profilSteg, aktoerlisteSteg, refreshSteg].map((steg) =>
        steg.oppsummering(),
      ),
    ].join('\n'),
  );
}
