export const SITE = {
  name: 'Nerd Caseiro',
  tagline: 'Automação, gadgets e impressão 3D pra sua casa',
  description:
    'Tutoriais de automação residencial, reviews de gadgets de casa inteligente e impressão 3D — escritos por um programador maker. Mostramos o código que funciona (Home Assistant, ESP32, Klipper) e indicamos o hardware que vale a pena, com pesquisa de specs reais e avaliações.',
  url: 'https://nerdcaseiro.com.br',
  locale: 'pt-BR',
  author: 'Márcio Costa',
  email: 'contato@nerdcaseiro.com.br',
  social: {
    instagram: '',
    youtube: '',
  },
} as const;

// Editor responsável — usado em E-E-A-T (Person schema, caixa de autor)
export const AUTHOR = {
  name: 'Márcio Costa',
  role: 'Editor responsável',
  bio: 'Formado em Informática (UCSAL), programador e maker de carteirinha — tem impressora 3D em casa e automatiza o próprio lar com Home Assistant, ESP32 e Raspberry Pi. Criou o Nerd Caseiro para mostrar, com código que funciona de verdade, como deixar a casa mais inteligente sem cair em listas genéricas. Cada recomendação passa pela metodologia do site: specs oficiais, avaliações reais de compradores e checagem de reclamações.',
  url: 'https://nerdcaseiro.com.br/sobre/',
} as const;

// Rede de sites do mesmo autor (disclosure honesta na página Sobre / caixa de autor).
export const NETWORK = [
  {
    name: 'Reforma Caseira',
    url: 'https://reformacaseira.com.br',
    blurb: 'Ferramentas, reforma e marcenaria amadora.',
  },
  {
    name: 'Abanou',
    url: 'https://abanou.com.br',
    blurb: 'Reviews de produtos para cães e gatos.',
  },
] as const;
