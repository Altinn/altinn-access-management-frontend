/* eslint-disable no-console */
import { readFileSync } from 'node:fs';
import { loadEnv } from 'playwright/util/helper';
import { TenorApiRequests } from './TenorApiRequests';

/**
 * Engangs-sjekk: verifiser at ingen testbrukere (daglige ledere) i
 * beomtilgang-testdataene er døde/utflyttet. Gyldig = personstatus "bosatt".
 *
 *   npx tsx tenor/sjekkPersonstatus.ts <csv> [<csv> ...]
 */

function lesPids(csvPath: string): string[] {
  const linjer = readFileSync(csvPath, 'utf8').trim().split('\n');
  const header = linjer[0].split(',');
  const pidIdx = header.indexOf('pid');
  return linjer.slice(1).map((l) => l.split(',')[pidIdx]);
}

function gjeldendeStatus(kildedata: Record<string, unknown>): string {
  const status = Array.isArray(kildedata.status) ? (kildedata.status as any[]) : [];
  const gjeldende = status.find((s) => s.erGjeldende) ?? status[status.length - 1];
  return gjeldende?.status ?? gjeldende?.personstatus ?? '(ukjent)';
}

async function main() {
  const filer = process.argv.slice(2);
  if (filer.length === 0) {
    console.error('Bruk: npx tsx tenor/sjekkPersonstatus.ts <csv> [<csv> ...]');
    process.exit(1);
  }
  loadEnv('tt02'); // freg (Tenor) er samme kilde uansett Altinn-miljø

  const pidTilFiler = new Map<string, Set<string>>();
  for (const fil of filer) {
    for (const pid of lesPids(fil)) {
      if (!pidTilFiler.has(pid)) pidTilFiler.set(pid, new Set());
      pidTilFiler.get(pid)!.add(fil.split('/').pop()!);
    }
  }

  const tenor = new TenorApiRequests();
  const pids = [...pidTilFiler.keys()];
  console.error(`Sjekker ${pids.length} unike pids mot Tenor (freg) ...`);

  const ikkeBosatt: Array<{ pid: string; status: string; filer: string }> = [];
  let bosattAntall = 0;

  for (const pid of pids) {
    const bosatt = await tenor.tellTreff('freg', `tenorMetadata.id:${pid} AND personstatus:bosatt`);
    if (bosatt > 0) {
      bosattAntall++;
      continue;
    }
    // Ikke bosatt – hent faktisk status for rapportering.
    const docs = await tenor.sokFreg(`tenorMetadata.id:${pid}`, 1);
    let status = '(finnes ikke i freg)';
    if (docs.length) {
      status = gjeldendeStatus(JSON.parse((docs[0] as any).tenorMetadata?.kildedata ?? '{}'));
    }
    ikkeBosatt.push({ pid, status, filer: [...pidTilFiler.get(pid)!].join(' ') });
  }

  console.log(`\nBosatt: ${bosattAntall}/${pids.length}`);
  if (ikkeBosatt.length === 0) {
    console.log('Alle testbrukere er bosatt. ✔');
  } else {
    console.log(`\nIKKE bosatt (${ikkeBosatt.length}):`);
    for (const r of ikkeBosatt) console.log(`  ${r.pid}  status=${r.status}  (${r.filer})`);
  }
}
main().catch((e) => {
  console.error(e);
  process.exit(1);
});
