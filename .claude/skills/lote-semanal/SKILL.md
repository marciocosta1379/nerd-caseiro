---
name: lote-semanal
description: Gera os 10 posts da semana para o Nerd Caseiro (7 na trilha da manhã + 3 na trilha da tarde) com APROVAÇÃO DO USUÁRIO EM ETAPAS. Use quando o usuário digitar /lote-semanal, pedir "gerar a semana" ou "criar os posts da semana". Nicho: automação residencial, casa inteligente, impressão 3D, eletrônica maker e gadgets.
---

# Skill: Lote Semanal de Posts — Nerd Caseiro

Site de tecnologia caseira tocado por agente, mas com **supervisão humana em cada etapa**.
O usuário provoca o início; o agente sugere; o usuário aprova; só no fim libera o agendamento.

## ⛔ Regra-mãe: NUNCA pule um gate

O fluxo tem **3 portões de aprovação**. Em cada um, **pare e espere o "ok" explícito** do
usuário antes de avançar. **Nunca** mude `draft:false`, **nunca** commite e **nunca** agende
sem a liberação final do usuário.

---

## Fluxo

### 0. Gatilho

O usuário dispara (`/lote-semanal [data da segunda]` ou "vamos gerar a semana"). Calcule as datas.

⚠️ **Cadência desde 05/09/2026: 10 posts por semana.**

| Trilha | Dias | Hora | `pubDate` |
|---|---|---|---|
| Manhã | seg a dom (7) | 07h | `2026-09-14` |
| Tarde | ter, qui, sáb (3) | 18h | `2026-09-15T18:00:00-03:00` |

A trilha da tarde do Nerd Caseiro é **sempre tutorial**. O `publish-scheduled.mjs` compara o
timestamp completo, então basta a hora no `pubDate` — não precisa mexer em script nenhum.
O `.github/workflows/publish-scheduled.yml` já tem os dois crons, mas quem dispara de verdade
é o **n8n** (dois triggers: 07h e 18h, timezone America/Sao_Paulo).

### Gate 1 — TEMAS (aprovação)

Sugira **10 temas** com data, trilha e tipo. Apresente em tabela. **Pare e espere aprovação.**

| Trilha | Tipo | Peso |
|-----|------|------|
| Manhã (7) | Listicle "Top N", Comparativo "X vs Y", Review individual | tráfego + conversão |
| Tarde (3) | **Tutorial (o moat)** | autoridade |

**De onde saem os temas** (⚠️ produto em voga, não data em voga):

- **Mais vendidos** — Amazon (`/gp/bestsellers/...` via `curl`, funciona), Mercado Livre, Shopee.
- **Trends** — Google Shopping/Trends, YouTube maker BR, X.
- ⚠️ **Antes de propor, varra `src/content/posts/` para não repetir tema já publicado.**

### Gate 2 — TÍTULOS (aprovação)

Títulos finais dos 10 posts. **Pare e espere aprovação.**

⚠️ **Comprimentos (o Bing Webmaster acusa curto demais como erro de SEO):**

- **Título: 40 a 70 caracteres.** Nada de título telegráfico.
- **Descrição meta: 120 a 160 caracteres.** O schema zod corta acima de 160 — valide antes.
- **Direto ao produto**, sem framing abstrato: *"Cartucho HP 664 ou 667: qual serve na sua impressora"*,
  não *"o universo da impressão doméstica"*.

### Passo 3 — Pesquisa + esqueleto (sem aprovação, é trabalho)

#### 3.1 — Links de afiliado

**Amazon (hoje é a loja principal do lote):** link do **SiteStripe** logado na amazon.com.br,
ou monte `https://www.amazon.com.br/dp/<ASIN>?tag=nerdcaseiro-20`. **Preço OCULTO**
(regra Amazon — só com PA-API).

**Mercado Livre:** o ML bloqueia acesso automatizado por WebFetch, `curl` e pela própria API
oficial (redirect `gz/account-verification`). O que funciona é **Chrome de verdade via CDP**:

```bash
npm run ml-scrape -- "<url do produto>"
```

Antes, abra o Chrome com `--remote-debugging-port=9222 --user-data-dir=<pasta temp>`. Chrome já
aberto sem a porta de debug não serve — suba uma instância separada.

- Página de catálogo com variação (cor/voltagem) sem opção escolhida → preço vem `null`.
  Use `ml-cdp-nav.mjs` para abrir, escolha a variante na janela do Chrome, e `ml-cdp-read.mjs`
  lê a página atual sem navegar de novo.
- **Todo preço extraído é provisório — confirme com o usuário antes de publicar.**
- ⚠️ O link curto `meli.la/CODE` resolve para a **página do perfil "Rede Caseira"**, não para o
  produto. É o comportamento do programa e o usuário optou por usar assim mesmo. Para **baixar a
  imagem**, use a URL longa do produto, não o `meli.la`.

**Hotmart:** reaproveite os links de curso já cadastrados (ver memória `hotmart-cursos-afiliados-rede`).

⚠️ **NUNCA invente link.** Se não conseguir o link real, escreva `[TODO: link real]` e avise o usuário.

#### 3.2 — Pesquisa externa (≥2 fontes)

Specs em docs oficiais, Reddit (r/homeassistant, r/3Dprinting), YouTube maker BR, Reclame Aqui.
**Regra de ouro: nunca invente specs.**

⚠️ **Protocolo de tutorial** (ver `CLAUDE.md`): o autor **não valida em bancada**. Toda config vem
de **documentação primária, com versão declarada e link**. Sem primeira pessoa falsa ("testei
aqui", "rodei por 3 meses"). Evite tutorial cujo erro sai caro (flash de firmware que brica placa).

#### 3.3 — Baixar imagens (WebP local)

JSON `[{id,name,brand,rating,image,stores:[{store,url}]}]` → `node scripts/search-products.mjs --file scripts/products-<slug>.json`.

- ⚠️ **A URL da imagem só pode vir do MESMO item da MESMA busca** — nunca de contexto anterior.
- O script **não sobrescreve arquivo existente**: se o `id` repetir, apague o `.webp` antes.
- Confira tamanhos: **< 2KB = imagem quebrada → remova**.
- **Imagem de referência não-produto** (diagrama, foto de espécie): use **Wikimedia Commons**
  (a API exige header `User-Agent`), **cheque a licença**, confirme que é o objeto certo, e
  **credite no post**. Diagrama próprio: SVG inline com `@media (prefers-color-scheme: dark)`.

#### 3.4 — Scaffold + frontmatter

`node scripts/scaffold-post.mjs --data ... --slug "<slug>" --category <cat> --title "<título>"`.
Categorias: `automacao-residencial | casa-inteligente | impressao-3d | eletronica-maker | ferramentas-maker | gadgets | audio-video | redes-wifi | energia-backup | home-office | guias`.

Frontmatter: `pubDate` (com hora nos posts de 18h), `author: 'Márcio Costa'`, `faq` espelhando a
seção FAQ em texto plano, `featured: true` nos 2-3 de maior apelo. ML pode levar `price` +
`priceCheckedAt`; **Amazon não**.

#### 3.5 — ⚠️ VERIFICAR ESTOQUE (obrigatório, antes do Gate 3)

Produto fora de estoque queima o clique. **Cheque todos** antes de apresentar:

```bash
curl -s -A "Mozilla/5.0" "https://www.amazon.com.br/dp/SEU_ASIN" | grep -o 'id="availability".\{0,120\}'
```

Sinal de compra possível: texto de disponibilidade positivo **e** presença de
`id="add-to-cart-button"`. Caso ambíguo → confirme no Browser pane. Sem estoque → **troque o produto**
(e apague a imagem órfã).

### Gate 3 — TEXTO (aprovação)

Preencha os `[TODO]`s, gere os cartões OG (`npm run og`), rode `npm run build` para validar o
schema, e **apresente ao usuário**. Mantenha `draft: true`. **Pare e espere aprovação.**

⚠️ **Entregue o link do localhost de CADA artigo** (`http://localhost:4321/posts/<slug>/`) — o
usuário revisa no navegador, artigo por artigo, não no terminal. Suba o dev server antes.

#### Imagem no corpo — regra atual

**Coloque a imagem onde o produto é citado no texto**, junto do argumento que o justifica.

- ❌ **Não** use bloco rígido `## N. Produto` + imagem em todo produto: fica monótono e previsível.
- ✅ Nem todo produto precisa de seção numerada — só quando o texto comporta.
- ✅ Mas **todo produto citado no corpo leva a imagem ali**, não só no card do rodapé.

#### Coerência produto ↔ texto (as duas metades da mesma regra)

- **Citou como necessário, tem que vender.** Se o texto diz que algo é preciso ter (timer, mídia
  filtrante, kit de teste, testador de cabo), esse item **entra na lista de produtos com botão**.
- **O que a tese rejeita, sai da lista.** Se o post argumenta contra um item, ele **não pode**
  aparecer no frontmatter, na tabela comparativa nem no corpo. Ao remover, varra os **três**
  lugares — é o erro que já aconteceu.

#### Estrutura por tipo

- **Listicle (Top N):** intro (200-300 pal.) → "Como avaliamos" → `<ComparisonTable>` → produtos
  (imagem + 150-300 pal. de análise real, prós/contras de fontes, veredicto, `<AffiliateButton>`)
  → "Como escolher" → FAQ. **2000-3000 pal.**
- **Comparativo (X vs Y):** intro → tabela lado a lado → análise de cada → "em que cenário cada um
  ganha" → veredicto por perfil. **1500-2500 pal.**
- **Review individual:** intro → specs → uso real (fontes) → prós/contras → 2-3 alternativas →
  veredicto. **1500-2500 pal.**
- **Tutorial:** o que vai montar + materiais (com `<AffiliateButton>`) → passo a passo com blocos
  de código **da documentação oficial, versão citada** → troubleshooting → FAQ.

⚠️ **Aprofunde o tema antes do produto.** Explique o problema e **por que** aquele produto resolve.
Post que vai direto para a vitrine parece caça-níquel.

### Gate final — LIBERAÇÃO (usuário)

Só **após o "ok" final**: confirme as `pubDate` futuras (mantendo `draft: true`), apague imagens
órfãs de produtos descartados durante as correções, `git add -A`, commite e **dê push**. O push é
o que efetivamente agenda — o `publish-scheduled` (n8n) vira `draft:false` na data e hora.

```bash
git -C E:/Site_afiliado_3 pull --rebase --autostash
```

O repo local costuma estar atrás dos commits automáticos de publicação — rebase antes de commitar.

## Diretrizes de tom

- Honesto (aponta o defeito real), técnico mas acessível, direto, brasileiro (R$).
- Sem hipérbole ("incrível", "melhor de todos"). Disclaimer de afiliado já é automático.
- Nos links ML, o recomendante aparece como "Rede Caseira" (o `MLAvisoModal` cuida).
- **Não sugerir nem vincular redes sociais** — o usuário não quer perfis sociais nos sites.
- **Endosso pessoal ("indicação do Nerd Caseiro", "o que usamos aqui") só entra quando o usuário
  autorizar explicitamente** — é a experiência dele, não do agente.

## Erros a evitar

- Pular um gate / commitar ou agendar sem aprovação.
- Inventar specs, links ou código; alegar teste que não houve.
- Não checar estoque; deixar produto sem imagem no corpo.
- Recomendar item que o próprio texto desaconselha.
- Título/descrição curtos demais; esquecer `pubDate`, `faq` ou `npm run og`.
- Usar UTM diferente de `nerdcaseiro` (o `AffiliateButton` já cuida).
