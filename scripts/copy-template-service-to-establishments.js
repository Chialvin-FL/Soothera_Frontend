/**
 * copy-template-service-to-establishments.js
 *
 * Copies the salon service with ID 0J0ceqHVjdaJiCTGQ8DX to every establishment
 * so each establishment has at least one provided service.
 *
 * How to run:
 *   SOOTHERA_TOKEN=<admin_or_superadmin_token> node scripts/copy-template-service-to-establishments.js
 *
 * Optional:
 *   DRY_RUN=true SOOTHERA_TOKEN=<token> node scripts/copy-template-service-to-establishments.js
 */

const fetch = require('node-fetch');
const FormData = require('form-data');

const BASE_URL = 'http://fl-soothera-api.somee.com/api';
const TEMPLATE_SERVICE_ID = '0J0ceqHVjdaJiCTGQ8DX';
const PAGE_SIZE = 100;
const DRY_RUN = String(process.env.DRY_RUN ?? '').toLowerCase() === 'true';
const BEARER_TOKEN = process.env.SOOTHERA_TOKEN ?? '';

if (!BEARER_TOKEN || BEARER_TOKEN.length < 20) {
  console.error(
    '\nNo token provided.\n' +
      'Run with: SOOTHERA_TOKEN=<admin_or_superadmin_token> node scripts/copy-template-service-to-establishments.js\n',
  );
  process.exit(1);
}

function authHeaders(extra = {}) {
  return {
    Authorization: `Bearer ${BEARER_TOKEN}`,
    ...extra,
  };
}

async function requestJson(url, options = {}) {
  const res = await fetch(url, options);
  const raw = await res.text();
  let json = null;

  try {
    json = raw ? JSON.parse(raw) : null;
  } catch {
    throw new Error(`HTTP ${res.status}: ${raw.slice(0, 300)}`);
  }

  if (!res.ok || json?.success === false) {
    throw new Error(`HTTP ${res.status}: ${json?.message ?? raw.slice(0, 300)}`);
  }

  return json;
}

function unwrapItems(data) {
  if (!data) return [];
  if (Array.isArray(data)) return data;
  if (Array.isArray(data.items)) return data.items;
  return [data];
}

async function getAllEstablishments() {
  const first = await requestJson(`${BASE_URL}/Establishment/view?page=1&pageSize=${PAGE_SIZE}`, {
    headers: authHeaders({ Accept: 'application/json' }),
  });

  const firstData = first.data;
  const items = unwrapItems(firstData);
  const totalPages = Number(firstData?.totalPages ?? 1);

  for (let page = 2; page <= totalPages; page++) {
    const next = await requestJson(`${BASE_URL}/Establishment/view?page=${page}&pageSize=${PAGE_SIZE}`, {
      headers: authHeaders({ Accept: 'application/json' }),
    });
    items.push(...unwrapItems(next.data));
  }

  return items.filter((item) => item?.id);
}

async function getServices(params) {
  const searchParams = new URLSearchParams({
    page: '1',
    pageSize: String(PAGE_SIZE),
    ...params,
  });

  const response = await requestJson(`${BASE_URL}/SalonService/get-service?${searchParams.toString()}`, {
    headers: authHeaders({ Accept: 'application/json' }),
  });

  return unwrapItems(response.data);
}

async function getTemplateService() {
  const services = await getServices({ salonServiceId: TEMPLATE_SERVICE_ID });
  const template = services.find((service) => service?.salonServiceId === TEMPLATE_SERVICE_ID) ?? services[0];

  if (!template) {
    throw new Error(`Template service not found: ${TEMPLATE_SERVICE_ID}`);
  }

  return template;
}

function appendArray(form, key, values) {
  if (!Array.isArray(values)) return;
  values.forEach((value) => {
    if (value !== undefined && value !== null && value !== '') {
      form.append(key, String(value));
    }
  });
}

function buildCopiedServiceForm(template, establishmentId) {
  const form = new FormData();

  form.append('EstablishmentId', establishmentId);
  form.append('TemplateServiceId', TEMPLATE_SERVICE_ID);
  form.append('ServiceName', template.serviceName ?? 'Template Service');
  form.append('Description', template.description ?? 'N/A');
  form.append('Category', String(template.category ?? 'Other'));
  appendArray(form, 'Price', template.price);
  appendArray(form, 'DurationMinutes', template.durationMinutes);
  appendArray(form, 'AddOns', template.addOns);
  appendArray(form, 'AddOnPrices', template.addOnPrices);
  form.append('IsActive', String(template.isActive ?? true));

  return form;
}

async function copyServiceToEstablishment(template, establishment, index, total) {
  const existingServices = await getServices({ establishmentId: establishment.id });
  const alreadyHasTemplate = existingServices.some(
    (service) =>
      service?.salonServiceId === TEMPLATE_SERVICE_ID ||
      String(service?.serviceName ?? '').trim().toLowerCase() ===
        String(template.serviceName ?? '').trim().toLowerCase(),
  );

  if (alreadyHasTemplate) {
    console.log(`SKIP [${index}/${total}] ${establishment.name} already has "${template.serviceName}".`);
    return { status: 'skipped' };
  }

  if (DRY_RUN) {
    console.log(`DRY  [${index}/${total}] Would copy "${template.serviceName}" to ${establishment.name}.`);
    return { status: 'dry-run' };
  }

  const form = buildCopiedServiceForm(template, establishment.id);
  const response = await requestJson(`${BASE_URL}/SalonService/add-service`, {
    method: 'POST',
    headers: authHeaders(form.getHeaders()),
    body: form,
  });

  console.log(
    `OK   [${index}/${total}] Copied "${template.serviceName}" to ${establishment.name} -> ${response.data?.id ?? 'created'}`,
  );
  return { status: 'created' };
}

async function main() {
  console.log(`\nTemplate service: ${TEMPLATE_SERVICE_ID}`);
  console.log(`API: ${BASE_URL}`);
  if (DRY_RUN) console.log('Mode: dry run');

  const template = await getTemplateService();
  const establishments = await getAllEstablishments();

  console.log(`\nFound ${establishments.length} establishments.`);
  console.log(`Copying service: ${template.serviceName ?? TEMPLATE_SERVICE_ID}\n`);

  const counts = { created: 0, skipped: 0, failed: 0, 'dry-run': 0 };

  for (let i = 0; i < establishments.length; i++) {
    const establishment = establishments[i];
    try {
      const result = await copyServiceToEstablishment(template, establishment, i + 1, establishments.length);
      counts[result.status] += 1;
    } catch (err) {
      counts.failed += 1;
      console.error(`FAIL [${i + 1}/${establishments.length}] ${establishment.name}: ${err.message}`);
    }

    await new Promise((resolve) => setTimeout(resolve, 250));
  }

  console.log('\nDone.');
  console.log(`Created: ${counts.created}`);
  console.log(`Skipped: ${counts.skipped}`);
  console.log(`Dry-run: ${counts['dry-run']}`);
  console.log(`Failed: ${counts.failed}\n`);
}

main().catch((err) => {
  console.error(`\nScript failed: ${err.message}\n`);
  process.exit(1);
});
