<p align="center">
  <img src="./favicon.svg" width="88" height="88" alt="Ícone do Miaulendário" />
</p>

<h1 align="center">Miaulendário</h1>

<p align="center">
  Um calendário visual e divertido para descobrir a semana atual, acompanhar o progresso do ano e saber quanto tempo ainda falta.
</p>

<p align="center">
  <a href="https://miaulendario.vercel.app/">Ver demonstração</a>
  ·
  <a href="https://www.buymeacoffee.com/sr.cj">Buy me a coffee</a>
</p>

![Prévia do Miaulendário](./og-image.png)

## Sobre

O Miaulendário apresenta a semana ISO atual em um calendário anual inspirado em papel quadriculado, anotações à mão e carimbos. Tudo funciona diretamente no navegador, sem cadastro, cookies, rastreamento ou chamadas para APIs.

## Recursos

- Semana e ano ISO atuais.
- Progresso percentual do ano.
- Dia atual dentro do ano.
- Dias e semanas restantes.
- Grade visual com semanas passadas, atual e futuras.
- Layout responsivo e suporte a movimento reduzido.
- Gatinho flutuante interativo com som gerado pelo navegador.
- Metadados para SEO, Open Graph e Twitter Cards.
- Content Security Policy e cabeçalhos de segurança para a Vercel.

## Tecnologias

- HTML5
- CSS3
- JavaScript vanilla
- Web Audio API
- Vercel

Não há dependências, framework, bundler ou etapa de build.

## Executando localmente

Clone o repositório:

```bash
git clone git@github.com:CarlosX26/miaulendario.git
cd miaulendario
```

Inicie qualquer servidor HTTP estático. Com Python:

```bash
python3 -m http.server 8000
```

Depois, acesse [http://localhost:8000](http://localhost:8000).

## Deploy na Vercel

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https%3A%2F%2Fgithub.com%2FCarlosX26%2Fmiaulendario)

Ao importar o repositório na Vercel, use:

- **Framework Preset:** Other
- **Build Command:** vazio
- **Output Directory:** `.`

O arquivo [`vercel.json`](./vercel.json) configura URLs limpas e os cabeçalhos de segurança.

## Estrutura

```text
.
├── index.html        # Page structure and metadata
├── index.css         # Visual design and responsive layout
├── index.js          # Calendar calculations and interactions
├── cat.gif           # Floating cat animation
├── favicon.svg       # Browser and search favicon
├── og-image.png      # Social sharing preview
├── robots.txt        # Crawler rules
├── sitemap.xml       # Search engine sitemap
└── vercel.json       # Vercel deployment configuration
```

## Privacidade e segurança

Todos os cálculos são executados localmente no navegador. O site não coleta nem envia dados pessoais.

O arquivo `.env` versionado neste projeto não contém credenciais ou configurações sensíveis — é apenas um easter egg culinário. Nunca coloque segredos reais em código JavaScript público.

## Autor

Criado por [CarlosX26](https://github.com/CarlosX26).

Se o Miaulendário deixou sua semana um pouco mais divertida, você pode [pagar um café](https://www.buymeacoffee.com/sr.cj).
