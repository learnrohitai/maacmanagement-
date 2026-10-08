import { writeFileSync, mkdirSync } from 'node:fs';
import { dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { rows } from './generate-role-credentials.mts';

const outDir = './data';
mkdirSync(outDir, { recursive: true });

const artifact = {
  generatedAt: new Date().toISOString(),
  note: 'One test email + temporary password per role. Temp passwords are plain text and should be rotated after first use.',
  roles: rows,
};

const outPath = `${outDir}/role-test-credentials.json`;
writeFileSync(outPath, JSON.stringify(artifact, null, 2) + '\n', 'utf8');
console.log(`Wrote ${outPath}`);
