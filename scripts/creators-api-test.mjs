#!/usr/bin/env node
/**
 * Teste da Amazon Creators API (sucessora da PA-API 5.0, aposentada em 15/05/2026).
 *
 * Auth: OAuth 2.0 client_credentials (Login with Amazon) — NAO e mais SigV4.
 * Estado em 10/09/2026: token sai 200 (credencial valida), mas a consulta ao
 * catalogo volta 403 AssociateNotEligible — a conta precisa de 10 vendas
 * qualificadas nos ultimos 30 dias. Nada a consertar no codigo ate la.
 *
 *   node scripts/creators-api-test.mjs                       # busca padrao
 *   node scripts/creators-api-test.mjs "sensor presenca zigbee"
 *   node scripts/creators-api-test.mjs --asin B0XXXXXXXX
 *
 * Credenciais: le de .env (AMAZON_CREATORS_CLIENT_ID / _SECRET) e, se nao achar,
 * cai no CSV baixado do painel (AMAZON_CREATORS_CSV aponta outro caminho).
 */
import fs from 'node:fs';

const CSV_PADRAO = 'C:/Users/marci/Downloads/API-Abanou-credentials.csv';
const TOKEN_URL = 'https://api.amazon.com/auth/o2/token'; // NA — vale para o BR
const API = 'https://creatorsapi.amazon/catalog/v1';

function credenciais() {
  const env = {};
  try {
    for (const l of fs.readFileSync('.env', 'utf8').split(/\r?\n/)) {
      const m = l.match(/^([A-Z_]+)\s*=\s*(.*)$/);
      if (m) env[m[1]] = m[2].trim().replace(/^['"]|['"]$/g, '');
    }
  } catch {}
  if (env.AMAZON_CREATORS_CLIENT_ID && env.AMAZON_CREATORS_SECRET) {
    return { id: env.AMAZON_CREATORS_CLIENT_ID, secret: env.AMAZON_CREATORS_SECRET, origem: '.env' };
  }
  const csv = process.env.AMAZON_CREATORS_CSV || CSV_PADRAO;
  if (!fs.existsSync(csv)) {
    console.error(`Sem credencial. Defina AMAZON_CREATORS_CLIENT_ID e AMAZON_CREATORS_SECRET no .env,\nou deixe o CSV do painel em ${csv}`);
    process.exit(1);
  }
  const c = fs.readFileSync(csv, 'utf8').trim().split(/\r?\n/)[1].match(/"([^"]*)"/g).map(s => s.slice(1, -1));
  return { id: c[2], secret: c[3], versao: c[4], origem: csv };
}

const TAG = process.env.AMAZON_AFFILIATE_TAG || 'nerdcaseiro-20';
const MARKETPLACE = 'www.amazon.com.br';
const RESOURCES = [
  'itemInfo.title',
  'itemInfo.byLineInfo',
  'itemInfo.features',
  'offersV2.listings.price',
  'offersV2.listings.availability',
  'offersV2.listings.condition',
  'offersV2.listings.merchantInfo',
  'customerReviews.starRating',
  'customerReviews.count',
  'images.primary.large',
];

const cred = credenciais();
console.log(`credencial de ${cred.origem} | client id ...${cred.id.slice(-6)} | tag=${TAG}\n`);

// 1. token
process.stdout.write('[1] token OAuth ... ');
const tokRes = await fetch(TOKEN_URL, {
  method: 'POST',
  headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
  body: new URLSearchParams({
    grant_type: 'client_credentials',
    client_id: cred.id,
    client_secret: cred.secret,
    scope: 'creatorsapi::default',
  }),
});
const tokTxt = await tokRes.text();
if (tokRes.status !== 200) {
  console.log(`HTTP ${tokRes.status}\n`, tokTxt.slice(0, 600));
  console.log('\n=> Credencial invalida ou revogada. Gere outra em Associados > Creators API.');
  process.exit(1);
}
const tok = JSON.parse(tokTxt);
console.log(`HTTP 200 (expira em ${tok.expires_in}s)`);

// 2. catalogo
const asinFlag = process.argv.indexOf('--asin');
const usaGet = asinFlag !== -1;
const arg = usaGet ? process.argv[asinFlag + 1] : (process.argv[2] || 'sensor de presenca zigbee');
const op = usaGet ? 'getItems' : 'searchItems';
const payload = usaGet
  ? { itemIds: arg.split(','), partnerTag: TAG, marketplace: MARKETPLACE, resources: RESOURCES }
  : { keywords: arg, partnerTag: TAG, marketplace: MARKETPLACE, itemCount: 3, resources: RESOURCES };

console.log(`[2] ${op} "${arg}" ... `);
const res = await fetch(`${API}/${op}`, {
  method: 'POST',
  headers: {
    Authorization: `Bearer ${tok.access_token}`,
    'Content-Type': 'application/json',
    'x-marketplace': MARKETPLACE,
  },
  body: JSON.stringify(payload),
});
const txt = await res.text();
let json = null; try { json = JSON.parse(txt); } catch {}

if (res.status !== 200) {
  console.log(`    HTTP ${res.status}`);
  console.log('   ', json?.message ?? txt.slice(0, 600));
  if (json?.reason === 'AssociateNotEligible') {
    console.log('\n=> A credencial esta OK. Falta elegibilidade: 10 vendas qualificadas');
    console.log('   nos ultimos 30 dias na conta de Associados. Retestar quando bater a meta.');
  }
  process.exit(1);
}

const items = json?.searchResult?.items || json?.itemsResult?.items || [];
console.log(`    HTTP 200 — ${items.length} item(ns)\n`);
for (const it of items) {
  const l = it.offersV2?.listings?.[0];
  console.log(`  ASIN  ${it.asin}`);
  console.log(`  ${it.itemInfo?.title?.displayValue ?? '-'}`);
  console.log(`  marca ${it.itemInfo?.byLineInfo?.brand?.displayValue ?? '-'}`);
  console.log(`  preco ${l?.price?.money?.displayAmount ?? l?.price?.displayAmount ?? '(sem oferta)'}`);
  console.log(`  estoq ${l?.availability?.message ?? l?.availability?.type ?? '-'}`);
  console.log(`  nota  ${it.customerReviews?.starRating?.value ?? '-'} (${it.customerReviews?.count ?? 0} avaliacoes)`);
  console.log(`  img   ${it.images?.primary?.large?.url ?? '-'}`);
  console.log(`  link  ${it.detailPageURL}\n`);
}
console.log('=> API LIBERADA. Agora da para automatizar preco, estoque, nota e imagem.');
