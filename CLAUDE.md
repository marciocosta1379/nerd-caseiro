# Nerd Caseiro — Tecnologia Caseira (Automação, Gadgets e Impressão 3D)

## Projeto

Site estático em **Astro 4** com MDX, hospedado na Hostinger (FTP). Nicho: **tecnologia para a casa** — automação residencial, casa inteligente, impressão 3D, eletrônica maker e gadgets. Conteúdo escrito na voz de um **programador maker**, com **código ancorado em documentação oficial** — fonte e versão sempre citadas. O autor **não valida em bancada**: a autoridade vem da fonte primária, não de teste próprio (ver *Tutorial técnico* nas regras editoriais).

Domínio: `nerdcaseiro.com.br`

Faz parte de uma **rede de sites sobre a casa**, do mesmo autor (Márcio Costa):
- **Reforma Caseira** (`reformacaseira.com.br`) — ferramentas/reforma/DIY
- **Abanou** (`abanou.com.br`) — pets

### Posicionamento (decisão-chave)
Não ser "blog de gadget genérico" (compete com portais gigantes). Ter:
- **Núcleo de autoridade** — tutoriais técnicos (Home Assistant, ESPHome, ESP32, Klipper) com **código conferido na documentação oficial**, versão declarada e link para a fonte. É o moat — diferencia de fazenda de conteúdo de IA, que publica config inventada por analogia.
- **Camada larga** — reviews/comparativos de gadgets de casa inteligente (topo de funil que se beneficia do halo do núcleo).

### Monetização — 3 motores
- **Mercado Livre (principal):** maioria do hardware. ⚠️ A conta de afiliado é **única para a rede e o perfil se chama "Rede Caseira"** — os links ML do Nerd Caseiro saem com essa identidade. O `MLAvisoModal` avisa o visitante disso, e a página Sobre faz a disclosure da rede.
- **Amazon Associados (secundária):** itens que faltam no ML. ID de rastreamento próprio em `.env` (`AMAZON_AFFILIATE_TAG=nerdcaseiro-20`, cadastrado em 21/07/2026 — cada site da rede tem o seu: `reformacaseira-20`, `nerdcaseiro-20`, `abanou-20`). Exige ~3 vendas/180d e PA-API travada → **preço da Amazon fica oculto** no lançamento.
- **Hotmart (digital):** cursos (Home Assistant, modelagem 3D, Arduino). Comissão alta.

### Sem YMYL
Vantagem do nicho: conteúdo é spec-driven, **sem temas de saúde/finanças**. Mais seguro para conteúdo gerado por agente.

## Comandos

```bash
npm run dev          # Dev server em localhost:4321 (mostra drafts)
npm run build        # Gera dist/
npm run deploy       # OG + build + pagefind + upload FTP
npm run search       # Baixa imagens dos produtos (search-products.mjs)
npm run scaffold     # Gera MDX a partir de JSON de produtos
npm run og           # Gera os cartões og:image
npm run publish-scheduled  # Publica posts com pubDate <= hoje
npm run update-prices      # Atualiza preços via API do Mercado Livre (pode falhar, ver nota abaixo)
npm run ml-scrape -- "<url1>" "<url2>"  # Coleta nome/preço/nota/imagem de produtos ML via Chrome real (CDP)
```

### ⚠️ Pesquisa de produtos no Mercado Livre
Desde 09/07/2026 o ML bloqueia acesso automatizado por qualquer via direta — WebFetch e `curl` caem num redirect de verificação anti-bot (`gz/account-verification`), e a própria API oficial (`update-prices.mjs`) passou a responder 404/403 mesmo com token válido. O que funciona: um Chrome **de verdade** controlado via CDP (`scripts/ml-cdp.mjs`), no mesmo molde do `petz-cdp.mjs` da rede. Abra o Chrome com `--remote-debugging-port=9222 --user-data-dir=<pasta temp>` antes de rodar `npm run ml-scrape`. Para página de catálogo com variação (cor/voltagem) sem opção selecionada, o preço vem `null` — nesse caso use `ml-cdp-nav.mjs` para abrir a página, escolha a variante na janela do Chrome, e `ml-cdp-read.mjs` lê a página atual sem navegar de novo. **Todo preço extraído é provisório** — confirme com o usuário antes de publicar (histórico de correções: ver memória da rede).

## Categorias válidas

Ancoradas nos 4 pilares do logo (Automação · Impressão 3D · Maker · Tecnologia):

`automacao-residencial` | `casa-inteligente` | `impressao-3d` | `eletronica-maker` | `ferramentas-maker` | `gadgets` | `audio-video` | `redes-wifi` | `energia-backup` | `home-office` | `guias`

## Componentes disponíveis nos posts MDX

```mdx
import AffiliateButton from '../../components/AffiliateButton.astro';
import ComparisonTable from '../../components/ComparisonTable.astro';
import ProsCons from '../../components/ProsCons.astro';
import ProductCard from '../../components/ProductCard.astro';
```

- `<AffiliateButton href="..." store="mercadolivre|amazon|hotmart" source="slug" />` — botão de afiliado (cor por loja, UTM `nerdcaseiro`). O botão `mercadolivre` abre o **`MLAvisoModal`** automaticamente.
- `<ComparisonTable rows={[{ name, brand, rating, highlight, stores: [{store,url}] }]} source="slug" />`
- `<ProsCons pros={[...]} cons={[...]} />`
- `<ProductCard name="..." stores={[...]} ... />`

## Modelo de produto (frontmatter)

```yaml
products:
  - name: 'Sensor de presença Zigbee XYZ'
    brand: 'Marca'
    rating: 4.6
    price: 79.90          # ML pode exibir preço; Amazon manter oculto
    stores:
      - store: 'mercadolivre'
        url: 'https://...'
      - store: 'amazon'
        url: 'https://www.amazon.com.br/dp/...?tag=nerdcaseiro-20'
    image: '/images/produtos/sensor-xyz.webp'
    pros: ['...']
    cons: ['...']
```

## Regras editoriais

- Todo post tem `<AffiliateDisclosure />` (injetado pelo template `[...slug].astro`): "Como Associado da Amazon, eu ganho com compras qualificadas." + menção de que links ML aparecem como **Rede Caseira**.
- Links de afiliado usam `rel="sponsored nofollow noopener noreferrer"`. UTM source é sempre `nerdcaseiro` (o `AffiliateButton` cuida).
- **Preço:** Mercado Livre pode exibir (`price` + `priceCheckedAt: 'DD/MM/AAAA'`). **Amazon não** (regra Amazon — só com PA-API).
- **Recorrência (a joia):** filamento 3D é consumível → priorizar no calendário.
- **Tutorial técnico (moat) — protocolo obrigatório.** O autor **não testa em bancada**. Por isso todo tutorial segue:
  - **Código só de fonte primária** — doc oficial (ESPHome, Home Assistant, Klipper), repo oficial ou exemplo do fabricante. **Nunca** montar YAML/config por analogia: é assim que se inventa opção que não existe.
  - **Versão declarada** no post (ex.: "conforme a documentação do ESPHome 2026.7"). HA e ESPHome quebram config entre releases; tutorial sem versão vira armadilha em 6 meses.
  - **Link para a doc oficial** no corpo do post, para o leitor conferir.
  - **Varredura de comunidade** (fórum HA, r/homeassistant, issues do GitHub) atrás do gotcha conhecido — o "funciona na doc mas quebra na prática".
  - **Sem primeira pessoa fingida.** Proibido "testei aqui em casa", "na minha impressora", "montei e funcionou". O texto descreve o procedimento e cita a fonte.
  - **Evitar tutorial de falha cara**: flash que pode brickar, bateria de lítio, rede elétrica. Preferir o reversível.
- Títulos entre 40-70 caracteres; descrições meta entre 120-160 caracteres. (Não só o máximo — o Bing Webmaster Tools sinaliza título/descrição **curtos demais** como erro de SEO moderado; evitar títulos telegráficos e descrições genéricas de uma linha.)
- Posts saem com `draft: true` por padrão.
- **Imagem de capa / og:image:** a foto do **1º produto** vira a capa nos cards e o cartão social (`scripts/make-og-images.mjs` → `public/images/og/<slug>.jpg`, JPG 1200×630). Coloque o produto principal em primeiro. **Nunca WebP na og:image** (WhatsApp não renderiza).
- **Regra de ouro:** nunca invente specs. Confirme em ≥2 fontes confiáveis.

### Fontes confiáveis para pesquisa
- Documentação oficial (Home Assistant, ESPHome, Klipper, fabricantes)
- Canais maker BR no YouTube
- Reddit (r/homeassistant, r/3Dprinting), fóruns
- Reclame Aqui (problemas reais)
- Sites oficiais das marcas

## Geração de conteúdo (skill com aprovação em etapas)

A skill `/lote-semanal` segue **checkpoints de aprovação do usuário** (ver `.claude/skills/lote-semanal/SKILL.md`):
1. Usuário dispara → 2. agente sugere **temas** (aprovação) → 3. agente sugere **títulos** (aprovação) → 4. agente escreve **texto** (aprovação) → 5. usuário **libera o agendamento**.
**Nunca** commitar nem mudar `draft:false` sem aprovação.

## Automação / Publicação

- `.github/workflows/publish-scheduled.yml` muda `draft:true → false` em posts com `pubDate <= hoje`, faz deploy e notifica o IndexNow.
- ⚠️ **O cron do GitHub Actions tem falhado** — quem dispara de forma confiável é o **n8n** (pasta `n8n/`), via `workflow_dispatch`. Não depender do cron do GitHub.


### Cadência: 10 posts/semana em duas trilhas (desde 04/09/2026)

| Trilha | Horário | Tema | `pubDate` |
|---|---|---|---|
| **Manhã** — 7/semana (todo dia) | 07:00 BRT | review / comparativo / gadget | só a data: `pubDate: 2026-09-16` |
| **Tarde** — 3/semana (**ter, qui, sáb**) | 18:00 BRT | **tutorial técnico** (ver protocolo nas regras editoriais) | **com hora**: `pubDate: 2026-09-16T18:00:00-03:00` |

⚠️ **A hora no `pubDate` do post da tarde é obrigatória.** Sem ela o post vale como
meia-noite e a rodada das 07:00 publica os dois juntos, no mesmo horário. Verificado:
`publish-scheduled.mjs` compara timestamp completo (`pubDate > now`), o YAML converte
`2026-09-16T18:00:00-03:00` em `Date` e o `z.date()` do schema aceita — não precisa
mudar script nem schema.

**Nunca pôr dois posts do mesmo pilar no mesmo dia** — é o que faz os dois competirem
pela mesma busca e dividirem a força entre si. A separação de tema entre as trilhas
existe exatamente para isso.

O disparo das 18h vem do **n8n** (regra cron `0 5 18 * * *`, fuso America/Sao_Paulo,
18:05 para dar folga contra atraso de relógio). Ver [[cadencia-10-por-semana-rede]].

## Estrutura de pastas

- `src/content/posts/` — posts MDX
- `src/pages/` — páginas e templates
- `src/components/` — componentes
- `src/layouts/BaseLayout.astro` — SEO, header, footer
- `src/config/site.ts` — config global (nome, URL, autor, rede)
- `scripts/` — automação (search, scaffold, deploy, og, publish-scheduled, update-prices)
- `public/images/produtos/` — imagens em WebP

## Credenciais

Em `.env` (não comitar). Ver `.env.example`. Necessário: FTP da Hostinger, `AMAZON_AFFILIATE_TAG`, link ML, link Hotmart.

## Pendências externas (configurar fora do código)

- Confirmar hospedagem de `nerdcaseiro.com.br` (FTP Hostinger).
- Inscrever em Mercado Livre Afiliados, Amazon Associados e Hotmart.
- Criar repo GitHub + secrets FTP + configurar trigger n8n.
- Criar propriedade GA4 e trocar `G-XXXXXXXXXX` em `BaseLayout.astro`. Verificar Search Console.
- Newsletter/MailerLite: **desabilitada** (componente removido). Reavaliar no futuro se quiser captar e-mails.
- Adicionar `public/images/ml-perfil.png` (print do perfil "Rede Caseira" no ML) para o `MLAvisoModal`.
