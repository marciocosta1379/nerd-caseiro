# Skill: Semana Coordenada da Rede Caseira

Orquestra conteúdo entre os **3 sites** do mesmo autor, com cross-link contextual. Para gerar
posts de **um site só**, use a `/lote-semanal` daquele repo. Esta skill é para coordenar a REDE.

Repos: `E:\Site` (Reforma), `E:\Site_afiliado_2` (Abanou), `E:\Site_afiliado_3` (Nerd Caseiro).
Cérebro editorial + regras de cross-link: **`E:\rede-caseira\REDE-EDITORIAL.md`** (LEIA primeiro).

## ⛔ Regras-mãe

- **Supervisão em etapas** (mesmos gates do `/lote-semanal`): temas → títulos → texto → liberação.
- **Cross-link só contextual, no corpo, ≤1-2 por artigo, nunca sitewide.**
- **Nunca** commitar/`draft:false`/agendar sem o "ok" do usuário, em **nenhum** dos repos.

## Cadência (desde 05/09/2026): 10 posts por semana, por site — 30 no total

| Trilha | Dias | Hora | `pubDate` |
|---|---|---|---|
| Manhã | seg a dom (7) | 07h | `2026-09-14` |
| Tarde | ter, qui, sáb (3) | 18h | `2026-09-15T18:00:00-03:00` |

Tema da trilha da tarde, por site:

| Site | Manhã (7) | Tarde (3) |
|---|---|---|
| **Abanou** | cães e gatos | **aquarismo** |
| **Nerd Caseiro** | review / comparativo / listicle | **tutorial** |
| **Reforma Caseira** | review / comparativo / listicle | **passo a passo** |

O `publish-scheduled.mjs` compara o timestamp completo — basta a hora no `pubDate`, sem mexer em
script. Os workflows já têm os dois crons (`0 10 * * *` e `5 21 * * *` UTC), mas quem dispara de
verdade é o **n8n**: dois triggers por site, 07h e 18h, timezone America/Sao_Paulo.

## Fluxo

### 0. Gatilho

Usuário pede a semana da rede (ex.: "monta a semana da rede de 14/09"). Calcule as datas.

### 1. Consultar o cérebro editorial

Leia `E:\rede-caseira\REDE-EDITORIAL.md`: pontes disponíveis, o que já foi publicado, regras.
⚠️ Varra também `src/content/posts/` dos três repos — não repetir tema já publicado.

### Gate 1 — TEMAS (aprovação)

Plano da semana cruzando os 3 sites (30 posts), com as **pontes** marcadas. Tabela:
Site · Dia · Hora · Tema · Tipo · Ponte→. **Espere aprovação.**

⚠️ **Produto em voga, não data em voga.** Os temas saem de mais vendidos (Amazon via `curl` em
`/gp/bestsellers/...`, Mercado Livre, Shopee, Petz por "Mais comprados") e de trends (Google
Shopping/Trends, YouTube, X) — não de gancho sazonal genérico.

### Gate 2 — TÍTULOS (aprovação)

Títulos finais dos 30 posts. **Título 40-70 caracteres, descrição meta 120-160** (o Bing acusa
curto demais como erro; o schema zod corta acima de 160). **Espere aprovação.**

### Passo 3 — Gerar por site (sem aprovação, é trabalho)

Siga a `/lote-semanal` **de cada repo** — cada um tem loja, schema de produto e método de coleta
próprios (Reforma usa `affiliateUrl`; Nerd e Abanou usam `stores:[{store,url}]`; Abanou e Reforma
têm bloco `faq`).

⚠️ **Antes de fechar, obrigatório em todos os repos:**

1. **Verificar estoque** de cada produto (`curl` na página `/dp/<ASIN>` + `id="availability"` e
   `id="add-to-cart-button"`; caso ambíguo, Browser pane). Sem estoque → trocar.
2. **Imagem no corpo** onde o produto é citado — sem bloco numerado rígido.
3. **Coerência produto ↔ texto**: o que o texto diz ser necessário tem botão de compra; o que o
   texto rejeita sai do frontmatter, da tabela e do corpo.
4. `npm run build` em cada repo para validar o schema.

### Passo 4 — Inserir os cross-links das pontes

Para cada par-ponte aprovado, um link contextual **no corpo** de A→B e de B→A. Respeite o limite
(1-2 por artigo) e a relevância. Atualize o calendário no `REDE-EDITORIAL.md`.

### Gate 3 — TEXTO (aprovação)

Apresente os posts por site **com o link do localhost de cada artigo**
(`http://localhost:<porta>/posts/<slug>/`) — o usuário revisa no navegador, artigo por artigo.
Suba os dev servers antes. `draft: true`. **Espere aprovação.**

### Gate final — LIBERAÇÃO (usuário)

Após o "ok", em **cada repo**:

```bash
git -C <repo> pull --rebase --autostash   # o local costuma estar atrás dos commits de publicação
```

Apague imagens órfãs de produtos descartados nas correções, confirme as `pubDate`, `git add -A`,
commite e **dê push**. O push é o que efetivamente agenda. Atualize o calendário rolante no
`REDE-EDITORIAL.md`.

## Lembretes

- Links ML de qualquer site saem como **"Rede Caseira"** (perfil único) → o `MLAvisoModal` cuida.
  O `meli.la/CODE` resolve para a página do perfil, não para o produto — o usuário optou por usar
  assim mesmo; para baixar imagem, use a URL longa.
- Cada site tem domínio/repo/secrets independentes — um não derruba o outro.
- Cross-link entre domínios é o diferencial da rede, mas **moderação é tudo** (evitar cara de PBN).
- **Não sugerir nem vincular redes sociais** em nenhum dos três sites.
- **Nunca alegar teste, obra ou criação que o autor não fez.** Endosso pessoal só quando o usuário
  autorizar explicitamente.
