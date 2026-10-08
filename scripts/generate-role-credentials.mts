const { generateTempPassword } = await import('../src/lib/password.ts');
import type { UserRole } from '../src/types/index.ts';

const ROLES: Array<{ role: UserRole; name: string }> = [
  { role: 'admin', name: 'Test Admin' },
  { role: 'academic-manager', name: 'Test Academic Manager' },
  { role: 'account-manager', name: 'Test Account Manager' },
  { role: 'placement-officer', name: 'Test Placement Officer' },
  { role: 'counselor', name: 'Test Counselor' },
  { role: 'teacher', name: 'Test Teacher' },
  { role: 'student', name: 'Test Student' },
];

const DOMAIN = 'maac.institute';

const rows = ROLES.map(({ role, name }) => ({
  name,
  role,
  email: `test-${role}@${DOMAIN}`,
  tempPassword: generateTempPassword(),
}));

const output = {
  generatedAt: new Date().toISOString(),
  note: 'One test email + temporary password per role. Temp passwords are plain text and should be rotated after first use.',
  roles: rows,
};

export { rows, output, DOMAIN };
