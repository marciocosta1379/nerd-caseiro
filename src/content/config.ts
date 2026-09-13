import { defineCollection, z } from 'astro:content';

// Loja de afiliado de cada link. Cada produto pode ter mais de uma.
const storeSchema = z.object({
  store: z.enum(['mercadolivre', 'amazon', 'hotmart']),
  url: z.string().url(),
});

const productSchema = z.object({
  name: z.string(),
  brand: z.string().optional(),
  rating: z.number().min(0).max(5).optional(),
  price: z.number().optional(),
  // Multi-loja (preferencial). Cada item gera um botão de afiliado.
  stores: z.array(storeSchema).optional(),
  // Retrocompat: link único (assumido como Mercado Livre se `stores` ausente).
  affiliateUrl: z.string().url().optional(),
  image: z.string().optional(),
  pros: z.array(z.string()).optional(),
  cons: z.array(z.string()).optional(),
});

const posts = defineCollection({
  type: 'content',
  schema: ({ image }) =>
    z.object({
      title: z.string().max(70),
      description: z.string().max(160),
      pubDate: z.date(),
      updatedDate: z.date().optional(),
      priceCheckedAt: z.string().optional(),
      image: image().optional(),
      imageAlt: z.string().optional(),
      // Capa explícita (caminho em public/). Sem ela, a capa é a foto do 1º produto.
      // Usada quando o assunto do post não é um produto de afiliado — ex.: um
      // lançamento que ainda não se vende, comparado com alternativas que se vendem.
      cover: z.string().optional(),
      category: z.enum([
        'automacao-residencial',
        'casa-inteligente',
        'impressao-3d',
        'eletronica-maker',
        'ferramentas-maker',
        'gadgets',
        'audio-video',
        'redes-wifi',
        'energia-backup',
        'home-office',
        'guias',
      ]),
      tags: z.array(z.string()).default([]),
      products: z.array(productSchema).default([]),
      faq: z
        .array(z.object({ question: z.string(), answer: z.string() }))
        .optional(),
      author: z.string().default('Márcio Costa'),
      draft: z.boolean().default(false),
      featured: z.boolean().default(false),
    }),
});

export const collections = { posts };
