# Controle de Contas — Angular

Versão em Angular (standalone components, Angular 17) do app de controle financeiro.
Os dados ficam salvos no navegador (localStorage) — nada é enviado pra fora.

## Como rodar

```bash
npm install
npm start
```

Depois abra http://localhost:4200

## Build de produção

```bash
npm run build
```

Os arquivos finais ficam em `dist/controle-financeiro`, prontos pra hospedar em
qualquer servidor estático (Netlify, Vercel, GitHub Pages, etc).

## Estrutura

- `src/app/models.ts` — tipos e funções utilitárias (formatação de moeda, cores por categoria)
- `src/app/services/storage.service.ts` — leitura/escrita no localStorage
- `src/app/services/data.service.ts` — estado da aplicação (signals): transações, categorias, cartões
- `src/app/components/` — uma pasta por tela: lançar, resumo, categorias, lançamentos, nav, edit-modal
