# LeadEvent

Sistema para captação de leads, credenciamento e automação de outreach em eventos. O LeadEvent integra formulários dinâmicos segmentados (Influenciadores e Patrocinadores), submissão opcional de vídeo, painel de triagem de perfis e fila de disparos automatizados com delay seguro anti-spam para WhatsApp e Instagram.

## Stack

- Next.js 16 (App Router)
- React 19 + TypeScript
- Tailwind CSS 4
- shadcn/ui (`components.json`, `src/components/ui`)

## Como rodar

```bash
npm install
npm run dev
```

Abra [http://localhost:3000](http://localhost:3000).

```bash
npm run build   # build de produção
npm run start   # serve o build
npm run lint    # ESLint
```

## Tela de acesso

A página inicial (`/`) exibe a escolha de perfil no lugar do formulário de login:

- **Sou Empresa** → `/empresa`
- **Sou Influencer** → `/influencer`

Arquivos principais:

- `src/app/page.tsx` — composição da página inicial (testemunhos, vídeo e rotas).
- `src/components/ui/sign-in.tsx` — componente shadcn da tela de acesso. Recebe `roles`, `testimonials`, `videoSrc`, `videoPosterSrc` e `onSelectRole`.
- `src/app/empresa/page.tsx` e `src/app/influencer/page.tsx` — placeholders para os próximos formulários.

As rotas dos botões ficam no array `roles` em `src/components/ui/sign-in.tsx` e podem ser trocadas sem alterar o layout:

```tsx
{
  id: "company",
  title: "Sou Empresa",
  description: "Encontre criadores para o seu próximo evento.",
  href: "/empresa",
  badge: "Patrocinador",
}
```

## Vídeo do painel lateral

O painel à direita usa um vídeo em loop que inicia automaticamente ao abrir a página:

- `public/media/leadevent-hero.mp4` — vídeo principal
- `public/media/leadevent-hero-poster.jpg` — imagem exibida enquanto o vídeo carrega

O player usa `autoPlay`, `muted`, `loop` e `playsInline` e tenta retomar a reprodução ao voltar o foco para a aba. Para trocar o vídeo, substitua os arquivos acima ou passe outros caminhos para `<SignInPage videoSrc="..." videoPosterSrc="..." />` em `src/app/page.tsx`.

O vídeo é decorativo (`aria-hidden`) e o painel é oculto abaixo do breakpoint `lg`, onde a tela fica em coluna única.
