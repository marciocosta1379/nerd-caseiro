import { readFile, writeFile } from 'fs/promises';
import { existsSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '..');
const POSTS_DIR = join(ROOT, 'src', 'content', 'posts');

function parseArgs() {
  const args = process.argv.slice(2);
  const opts = { data: '', slug: '', title: '', category: 'guias', draft: true };

  for (let i = 0; i < args.length; i++) {
    if (args[i] === '--data' && args[i + 1]) { opts.data = args[i + 1]; i++; }
    else if (args[i] === '--slug' && args[i + 1]) { opts.slug = args[i + 1]; i++; }
    else if (args[i] === '--title' && args[i + 1]) { opts.title = args[i + 1]; i++; }
    else if (args[i] === '--category' && args[i + 1]) { opts.category = args[i + 1]; i++; }
    else if (args[i] === '--publish') { opts.draft = false; }
  }

  if (!opts.data || !opts.slug) {
    console.error('Uso: node scripts/scaffold-post.mjs --data products-xxx.json --slug "melhores-xxx" [--title "..."] [--category gadgets] [--publish]');
    console.error('Categorias: automacao-residencial | casa-inteligente | impressao-3d | eletronica-maker | ferramentas-maker | gadgets | audio-video | redes-wifi | energia-backup | home-office | guias');
    process.exit(1);
  }

  return opts;
}

// Normaliza as lojas de afiliado de um produto vindo do JSON.
// Aceita: p.stores[], ou p.mercadolivreUrl / p.amazonUrl / p.hotmartUrl, ou p.affiliateUrl (= Mercado Livre).
function storesOf(p) {
  if (Array.isArray(p.stores) && p.stores.length) return p.stores;
  const s = [];
  if (p.mercadolivreUrl) s.push({ store: 'mercadolivre', url: p.mercadolivreUrl });
  if (p.amazonUrl) s.push({ store: 'amazon', url: p.amazonUrl });
  if (p.hotmartUrl) s.push({ store: 'hotmart', url: p.hotmartUrl });
  if (!s.length && p.affiliateUrl) s.push({ store: 'mercadolivre', url: p.affiliateUrl });
  if (!s.length) s.push({ store: 'mercadolivre', url: '[TODO: link de afiliado]' });
  return s;
}

function generateMdx(products, opts) {
  const today = new Date().toISOString().split('T')[0];
  const title = opts.title || `[TODO: Título do post - ex: Os ${products.length} melhores ...]`;
  const description = '[TODO: Descrição meta de até 160 caracteres para SEO]';

  const productsYaml = products.map((p) => {
    const lines = [
      `  - name: '${p.name.replace(/'/g, "''")}'`,
    ];
    if (p.brand) lines.push(`    brand: '${p.brand}'`);
    lines.push(`    rating: ${p.rating ?? '[TODO: nota de 1 a 5]'}`);
    // Mercado Livre permite exibir preço (use priceCheckedAt no frontmatter).
    // Amazon: manter preço oculto até liberar a PA-API.
    if (p.price) lines.push(`    price: ${p.price}`);
    else lines.push(`    # price: [opcional — ML pode exibir; Amazon manter oculto]`);
    lines.push(`    stores:`);
    for (const s of storesOf(p)) {
      lines.push(`      - store: '${s.store}'`);
      lines.push(`        url: '${s.url}'`);
    }
    if (p.image) lines.push(`    image: '${p.image}'`);
    lines.push(`    pros:`);
    lines.push(`      - '[TODO: ponto positivo 1]'`);
    lines.push(`      - '[TODO: ponto positivo 2]'`);
    lines.push(`    cons:`);
    lines.push(`      - '[TODO: ponto negativo 1]'`);
    lines.push(`      - '[TODO: ponto negativo 2]'`);
    return lines.join('\n');
  }).join('\n');

  const comparisonRows = products.map((p) => {
    const storesInline = storesOf(p)
      .map((s) => `{ store: '${s.store}', url: '${s.url}' }`)
      .join(', ');
    return `    { name: '${p.name.replace(/'/g, "\\'")}', brand: '${p.brand ?? ''}', rating: ${p.rating ?? 4.0}, highlight: '[TODO]', stores: [${storesInline}] },`;
  }).join('\n');

  const productSections = products.map((p, i) => {
    const buttons = storesOf(p)
      .map((s) => `<AffiliateButton href="${s.url}" store="${s.store}" source="${opts.slug}" />`)
      .join('\n');
    return `## ${i + 1}. ${p.name}

${p.image ? `![${p.name}](${p.image})` : ''}

${p.brand ? `Marca: ${p.brand}` : ''}

[TODO: Escrever análise de 150-300 palavras sobre este produto. Incluir:
- Para qual perfil/uso é indicado (iniciante, avançado, tipo de casa)
- Specs/recursos relevantes (conectividade, compatibilidade, potência)
- Pontos fortes no uso real
- Pontos fracos ou limitações
- Comparação com outros da lista
- Veredicto final — vale a pena?]

${buttons}

---`;
  }).join('\n\n');

  return `---
title: '${title}'
description: '${description}'
pubDate: ${today}
category: '${opts.category}'
tags: ['[TODO: tags — ex: home-assistant, esp32, zigbee, alexa]']
featured: false
draft: ${opts.draft}
products:
${productsYaml}
---

import AffiliateButton from '../../components/AffiliateButton.astro';
import ComparisonTable from '../../components/ComparisonTable.astro';

[TODO: Introdução de 200-300 palavras. Explicar:
- Qual problema este post resolve para o leitor
- Metodologia de avaliação
- Para quem é este guia]

## Como avaliamos

[TODO: Descrever critérios de avaliação. Exemplos:
- Relação custo-benefício
- Compatibilidade (Wi-Fi, Zigbee, Matter, Home Assistant)
- Facilidade de instalação/configuração
- Confiabilidade e suporte do fabricante]

## Tabela comparativa

<ComparisonTable
  source="${opts.slug}"
  rows={[
${comparisonRows}
  ]}
/>

${productSections}

## Como escolher

[TODO: Guia de decisão em 3-4 perguntas que ajudam o leitor a escolher entre os produtos]

## Perguntas frequentes

[TODO: 3-5 perguntas frequentes relevantes para este tipo de produto]

---

*Dúvidas sobre algum produto? [Fale com a gente](/contato/).*
`;
}

async function main() {
  const opts = parseArgs();

  const raw = await readFile(opts.data, 'utf-8');
  const products = JSON.parse(raw);

  console.log(`Gerando post "${opts.slug}" com ${products.length} produtos...`);

  const mdx = generateMdx(products, opts);
  const outFile = join(POSTS_DIR, `${opts.slug}.mdx`);

  if (existsSync(outFile)) {
    console.error(`Arquivo já existe: ${outFile}`);
    console.error('Use um slug diferente ou delete o arquivo existente.');
    process.exit(1);
  }

  await writeFile(outFile, mdx, 'utf-8');
  console.log(`Post criado: ${outFile}`);
  console.log(`\nPróximo passo: abra o arquivo e preencha os [TODO]s.`);
  console.log(`Depois: npm run deploy`);
}

main().catch((err) => {
  console.error('Erro:', err.message);
  process.exit(1);
});
