// Auto-generert av yarn tenor:generate — ikke rediger manuelt

import rawData from './tenor-testdata.json';

type TenorEntry = { orgNr: string; orgName: string; pid: string; name: string };

export const tenorTestdata = (rawData as TenorEntry[]).sort(() => Math.random() - 0.5);
