---
name: lote-semanal
description: Gera os posts da semana (seg–sex) para o Nerd Caseiro com APROVAÇÃO DO USUÁRIO EM ETAPAS. Use quando o usuário digitar /lote-semanal, pedir "gerar a semana" ou "criar os posts da semana". Nicho: automação residencial, casa inteligente, impressão 3D, eletrônica maker e gadgets.
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
O usuário dispara (`/lote-semanal [data da segunda]` ou "vamos gerar a semana"). Calcule as
5 datas seg–sex a partir da data fornecida (ou pergunte a semana).

### Gate 1 — TEMAS (aprovação)
Sugira **5 temas** com data e tipo, e **espere aprovação**. Mix editorial do nicho:

| Dia | Tipo | Peso |
|-----|------|------|
| Seg | Listicle "Top N" | tráfego |
| Ter | Comparativo "X vs Y" | conversão |
| Qua | Listicle "Top N" | tráfego |
| Qui | **Tutorial técnico (o moat)** | autoridade |
| Sex | Review individual | nicho |

- **Tutorial técnico = o diferencial.** Pelo menos **1 por semana**, com **código real e
  testado** (Home Assistant YAML, ESPHome, sketch ESP32, config Klipper). O usuário, que é
  programador, valida o código. Ex.: *"Automatize a luz da sala com Home Assistant + Sonoff"*.
- Apresente em tabela. **Pare e espere o usuário aprovar/ajustar os temas.**

### Gate 2 — TÍTULOS (aprovação)
Para os temas aprovados, proponha os **5 títulos finais** (≤ 70 caracteres, com número/benefício
quando for listicle). **Pare e espere o usuário aprovar/ajustar os títulos.**

### Passo 3 — Pesquisa + esqueleto (sem aprovação, é trabalho)

#### 3.1 — Coletar link de afiliado ML (MÉTODO CANÔNICO — testado)

⚠️ **NUNCA gere link de afiliado a partir de uma URL de BUSCA** (`lista.mercadolivre.com.br/...`).
Isso produz um link que aponta pro resultado de busca, não pro produto — errado. **Sempre use a
PÁGINA DO PRODUTO específico.**

Para cada produto (via Claude in Chrome — use **`javascript_tool`**, NÃO screenshots: as páginas
do ML penduram no "document_idle" e screenshots/`read_page` estouram):

1. **Achar o produto:** navegue para uma busca (`lista.mercadolivre.com.br/<query>`) e pegue o
   **1º resultado ORGÂNICO** (pule patrocinados: href com `click1`/`mclics` não tem produto). Pegue
   a URL limpa do produto: padrão `/p/MLB\d+`, `produto.mercadolivre.com.br/MLB-\d+` ou `/up/MLBU\d+`.
2. **Navegue para a página do produto** e rode UM `javascript_tool` que:
   - **Preço:** `document.querySelector('[itemprop="price"]')?.getAttribute('content')` → preço
     estruturado e confiável (NÃO leia o carrossel/“12x”/parcela — dá valor errado).
   - **Imagem:** `[...document.querySelectorAll('figure img,[class*="gallery"] img')].find(i=>/mlstatic/.test(i.src))`.
     Para baixar em alta, troque para a variante `D_Q_NP_2X_..._-E.webp`.
   - **Link de afiliado:** clique no botão `document.querySelector('.generate_link_button')` (o
     "Compartilhar/Gerar link" da própria página do produto) e leia o `meli.la/CODE` que aparece no DOM.
     ```js
     // dentro de um Promise/await: clica e espera o código novo aparecer
     const before = new Set([...document.body.innerText.matchAll(/meli\.la\/([A-Za-z0-9]+)/g)].map(m=>m[1]));
     document.querySelector('.generate_link_button').click();
     // poll a cada 500ms o body por um meli.la/CODE que não estava em `before`
     ```

**Pegadinhas (todas observadas na prática):**
- O **filtro de privacidade** bloqueia retornar strings com cookie/query-string. Retorne **só o
  código curto** (`meli.la/CODE` ou só o CODE), nunca URLs longas com `?...`.
- O **clipboard fica bloqueado** — leia o `meli.la` do DOM, não do `navigator.clipboard`.
- O código é **determinístico por produto+conta**: regenerar o mesmo produto dá o mesmo código
  (serve pra confirmar que um link já está certo).
- Algumas páginas de produto **não carregam** (título vira "(1)"/vazio) — pegue outro produto.
- **UTM no `meli.la` é OK** (o `AffiliateButton` anexa `?utm_source=nerdcaseiro...`; funciona, igual no Reforma).
- **Amazon (secundária):** SiteStripe na amazon.com.br (tag `nerdcaseiro-20`, **sem preço**). **Hotmart:** link do curso.

#### 3.2 — Pesquisa externa (≥2 fontes)
Specs/compatibilidade reais em docs oficiais (Home Assistant, ESPHome, Klipper, fabricantes),
Reddit (r/homeassistant, r/3Dprinting), YouTube maker BR, Reclame Aqui. **Regra de ouro: nunca invente specs.**

#### 3.3 — Baixar imagens (WebP local)
Monte um JSON `[{id,name,brand,rating,image:"<url mlstatic>",stores:[{store:'mercadolivre',url:'https://meli.la/CODE'}]}]`
e rode `node scripts/search-products.mjs --file scripts/products-<slug>.json` (baixa em
`public/images/produtos/<id>.webp`). **Confira tamanhos < 2KB = imagem quebrada → remova.**

#### 3.4 — Scaffold + frontmatter
`node scripts/scaffold-post.mjs --data ... --slug "<slug>" --category <cat> --title "<título>"`.
Categorias: `automacao-residencial | casa-inteligente | impressao-3d | eletronica-maker | ferramentas-maker | gadgets | audio-video | redes-wifi | energia-backup | home-office | guias`.
No frontmatter, cada produto leva `price` (do `itemprop`) e `image` (WebP local); o post leva `priceCheckedAt: 'DD/MM/AAAA'`.

### Gate 3 — TEXTO (aprovação)
Preencha os `[TODO]`s com conteúdo de qualidade (estrutura por tipo abaixo), gere os cartões OG
(`npm run og`), e **apresente os posts prontos ao usuário** (caminhos + resumo). Mantenha
`draft: true`. **Pare e espere o usuário aprovar/corrigir o texto.**

⚠️ **Imagem no CORPO de cada produto:** logo após cada `## N. Produto`, insira
`![Nome](/images/produtos/<id>.webp)`. Não basta a imagem no card do rodapé — o leitor quer ver o
produto na seção que está lendo. A tabela comparativa e os cards usam `price` (ML pode exibir).

Estrutura por tipo:
- **Listicle (Top N):** intro (200-300 pal.) -> "Como avaliamos" -> `<ComparisonTable>` (com `price`) -> por produto
  (`![img]` + 150-300 pal.: análise real, prós/contras de fontes, veredicto, `<AffiliateButton>`) -> "Como
  escolher" -> FAQ. Total 2000-3000 pal.
- **Comparativo (X vs Y):** intro -> tabela lado a lado -> análise de cada -> "Em que cenário cada um
  ganha" -> veredicto por perfil. 1500-2500 pal.
- **Review individual:** intro -> specs -> uso real (fontes) -> prós/contras -> 2-3 alternativas ->
  veredicto. 1500-2500 pal.
- **Tutorial técnico:** o que vai montar + lista de materiais (com `<AffiliateButton>`) -> passo a
  passo com **blocos de código testados** -> dicas/troubleshooting -> FAQ. O código é o ponto alto.

Adicionar no frontmatter: `pubDate` (data agendada), `author: 'Márcio Costa'`, array `faq`
espelhando a seção "Perguntas frequentes" (texto plano), e `featured: true` nos 2-3 de maior apelo.

### Gate final — LIBERAÇÃO (usuário)
Só **após o "ok" final** do usuário: confirme as `pubDate` futuras (mantendo `draft: true`),
commite os arquivos. O `publish-scheduled` (disparado pelo n8n) vira `draft:false` na data.

## Diretrizes de tom
- Honesto (aponta o defeito real), técnico mas acessível, direto, brasileiro (R$).
- Sem hipérbole ("incrível", "melhor de todos"). Disclaimer de afiliado já é automático.
- Nos links ML, lembrar que o recomendante aparece como "Rede Caseira" (o `MLAvisoModal` cuida).

## Erros a evitar
- Pular um gate / agendar sem aprovação.
- Inventar specs ou trechos de código não testados.
- Esquecer `pubDate`, `faq` ou de rodar `npm run og`.
- Usar UTM diferente de `nerdcaseiro` (o `AffiliateButton` já cuida).
