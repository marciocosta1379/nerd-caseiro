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
Para cada post:
1. **Coletar produtos/links de afiliado:**
   - Mercado Livre (principal) via painel de afiliados → link `meli.la/...` (sai como "Rede Caseira").
   - Amazon (secundária) via SiteStripe (link com a tag `nerdcaseiro-20`, **sem preço**).
   - Hotmart (cursos), quando fizer sentido.
2. **Pesquisa externa (≥2 fontes):** specs/compatibilidade reais em docs oficiais (Home Assistant,
   ESPHome, Klipper, fabricantes), Reddit (r/homeassistant, r/3Dprinting), YouTube maker BR,
   Reclame Aqui. **Regra de ouro: nunca invente specs.**
3. **Baixar imagens:** montar JSON e rodar `node scripts/search-products.mjs --file scripts/products-<slug>.json`.
4. **Scaffold:** `node scripts/scaffold-post.mjs --data scripts/products-<ts>.json --slug "<slug>" --category <categoria> --title "<título aprovado>"`.
   Categorias: `automacao-residencial | casa-inteligente | impressao-3d | eletronica-maker | ferramentas-maker | gadgets | audio-video | redes-wifi | energia-backup | home-office | guias`.

### Gate 3 — TEXTO (aprovação)
Preencha os `[TODO]`s com conteúdo de qualidade (estrutura por tipo abaixo), gere os cartões OG
(`npm run og`), e **apresente os posts prontos ao usuário** (caminhos + resumo). Mantenha
`draft: true`. **Pare e espere o usuário aprovar/corrigir o texto.**

Estrutura por tipo:
- **Listicle (Top N):** intro (200-300 pal.) -> "Como avaliamos" -> `<ComparisonTable>` -> por produto
  (150-300 pal.: análise real, prós/contras de fontes, veredicto, `<AffiliateButton>`) -> "Como
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
