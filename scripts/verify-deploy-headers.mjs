#!/usr/bin/env node

const DEFAULT_ORIGIN = 'https://mobile.rhein-neckar-tango.de';
const origin = normalizeOrigin(process.env.RNT_VERIFY_ORIGIN ?? DEFAULT_ORIGIN);

const requiredChecks = [
  {
    path: '/',
    name: 'root document',
    status: 200,
    headers: [
      {
        name: 'cache-control',
        includes: ['no-store', 'no-cache', 'must-revalidate', 'max-age=0'],
      },
    ],
  },
  {
    path: '/service-worker.js',
    name: 'service worker',
    status: 200,
    headers: [
      {
        name: 'cache-control',
        includes: ['no-store', 'no-cache', 'must-revalidate', 'max-age=0'],
      },
      {
        name: 'service-worker-allowed',
        equals: '/',
      },
    ],
  },
  {
    path: '/_app/version.json',
    name: 'version metadata',
    status: 200,
    headers: [
      {
        name: 'cache-control',
        includes: ['no-store', 'no-cache', 'must-revalidate', 'max-age=0'],
      },
    ],
  },
];

const optionalChecks = [
  {
    path: '/llms.txt',
    name: 'llms text',
    status: 200,
    headers: [
      {
        name: 'cache-control',
        includes: ['max-age=86400'],
      },
    ],
  },
];

const failures = [];

for (const check of requiredChecks) {
  await verifyUrl(check, { required: true });
}

for (const check of optionalChecks) {
  await verifyUrl(check, { required: false });
}

if (failures.length > 0) {
  console.error('\nHeader verification failed:');
  for (const failure of failures) {
    console.error(`- ${failure}`);
  }
  process.exit(1);
}

console.log(`\nHeader verification passed for ${origin}`);

async function verifyUrl(check, { required }) {
  const url = `${origin}${check.path}`;
  const response = await fetch(url, {
    method: 'GET',
    redirect: 'manual',
    headers: {
      accept: check.path.endsWith('.json') ? 'application/json' : 'text/html,*/*;q=0.8',
      'cache-control': 'no-cache',
      pragma: 'no-cache',
    },
  });

  if (response.status === 404 && !required) {
    console.log(`SKIP ${check.name}: ${url} returned 404`);
    return;
  }

  if (response.status !== check.status) {
    failures.push(`${check.name}: expected HTTP ${check.status}, got ${response.status} at ${url}`);
    return;
  }

  for (const headerCheck of check.headers) {
    const actual = response.headers.get(headerCheck.name);
    if (!actual) {
      failures.push(`${check.name}: missing ${headerCheck.name} header at ${url}`);
      continue;
    }

    if (headerCheck.equals && actual !== headerCheck.equals) {
      failures.push(
        `${check.name}: expected ${headerCheck.name}=${headerCheck.equals}, got ${actual}`,
      );
    }

    for (const expectedPart of headerCheck.includes ?? []) {
      if (!actual.toLowerCase().includes(expectedPart.toLowerCase())) {
        failures.push(
          `${check.name}: expected ${headerCheck.name} to include ${expectedPart}, got ${actual}`,
        );
      }
    }
  }

  console.log(`OK ${check.name}: ${url}`);
}

function normalizeOrigin(value) {
  return value.replace(/\/$/, '');
}
