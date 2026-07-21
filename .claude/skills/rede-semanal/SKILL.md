---
name: rede-semanal
description: Orquestra uma semana de conteúdo COORDENADA entre os 3 sites da Rede Caseira (Reforma Caseira, Abanou, Nerd Caseiro), inserindo cross-links nas pontes. Use quando o usuário pedir para planejar/gerar a semana da REDE (vários sites de uma vez), não de um site só.
---

# Skill: Semana Coordenada da Rede Caseira

Orquestra conteúdo entre os **3 sites** do mesmo autor, com cross-link contextual. Para gerar
posts de **um site só**, use a `/lote-semanal` daquele repo. Esta skill é para coordenar a REDE.

Repos: `E:\site` (Reforma), `E:\Site_afiliado_2` (Abanou), `E:\Site_afiliado_3` (Nerd Caseiro).
Cérebro editorial + regras de cross-link: **`E:\rede-caseira\REDE-EDITORIAL.md`** (LEIA primeiro).

## ⛔ Regras-mãe
- **Supervisão em etapas** (mesmos gates do `/lote-semanal`): temas → títulos → texto → liberação.
- **Cross-link só contextual, no corpo, ≤1-2 por artigo, nunca sitewide.** (Ver regras no REDE-EDITORIAL.md.)
- **Nunca** commitar/`draft:false`/agendar sem o "ok" do usuário, em **nenhum** dos repos.

## Fluxo

### 0. Gatilho
Usuário pede a semana da rede (ex.: "monta a semana da rede de 15/06"). Calcule as datas.

### 1. Consultar o cérebro editorial
Leia `E:\rede-caseira\REDE-EDITORIAL.md`: pontes disponíveis, o que já foi publicado, regras.

### Gate 1 — TEMAS (aprovação)
Proponha um **plano da semana cruzando os 3 sites**: quais sites recebem posts, quais temas, e
**marque os pares-ponte** (post de um site que vai linkar o de outro). ⚠️ Cadência é **diária
(7 dias, seg-dom)** desde 21/07/2026 — antes era só seg-sex. Não precisa todo site ter post todo
dia — distribua conforme a estratégia. Apresente em tabela (Site · Dia · Tema · Tipo · Ponte→).
**Espere aprovação.**

### Gate 2 — TÍTULOS (aprovação)
Títulos finais (≤70 car.) de todos os posts. **Espere aprovação.**

### Passo 3 — Gerar por site (sem aprovação, é trabalho)
Para **cada site**, siga a `/lote-semanal` **daquele repo** (cada um tem suas lojas e método de
coleta próprios — Reforma/Nerd via ML `generate_link_button`; Abanou via Amazon/Petz). Gere os
esqueletos e preencha o conteúdo no repo correto.

### Passo 4 — Inserir os cross-links das pontes
Para cada par-ponte aprovado, adicione **no corpo** um link contextual de A→B e de B→A (quando os
dois lados existirem/forem publicados). Ex.: no tutorial "alimentador com ESP32" (Nerd Caseiro),
um parágrafo: *"Já a escolha do comedouro pronto a gente comparou [aqui](https://abanou.com.br/posts/...)"*.
Respeite o limite (1-2 links) e a relevância. Atualize o calendário no REDE-EDITORIAL.md.

### Gate 3 — TEXTO (aprovação)
Apresente todos os posts (por site, com os caminhos) + as pontes inseridas. `draft: true`. **Espere aprovação.**

### Gate final — LIBERAÇÃO (usuário)
Após o "ok": em **cada repo**, confirme `pubDate`, commite e dê push (cada site publica via seu n8n).
Atualize o calendário rolante no `REDE-EDITORIAL.md`.

## Lembretes
- Links ML de qualquer site saem como **"Rede Caseira"** (perfil único) → o `MLAvisoModal` cuida.
- Cada site tem domínio/repo/secrets independentes — um não derruba o outro.
- Cross-link entre domínios é o diferencial da rede, mas **moderação é tudo** (evitar cara de PBN).
