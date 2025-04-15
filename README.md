
# Internet 3.0

Sistema descentralizado para compartilhamento de arquivos, chat e feed de conteúdo.

## Funcionalidades

- **Gerenciador de Identidade**: Crie e gerencie sua identidade na rede descentralizada
- **Chat P2P**: Comunicação direta entre usuários via WebRTC
- **Compartilhamento de Arquivos**: Upload e download de arquivos via IPFS
- **Feed de Conteúdo**: Compartilhe e visualize posts na rede

## Tecnologias

- Frontend: React + TypeScript + Vite
- Backend: Express + TypeScript
- P2P: WebRTC
- Armazenamento Descentralizado: IPFS
- Banco de Dados: SQLite + Drizzle ORM
- UI: Tailwind CSS + shadcn/ui

## Estrutura do Projeto

```
├── client/          # Frontend React
├── server/          # Backend Express
└── shared/          # Schemas e tipos compartilhados
```

## Desenvolvimento

1. Instale as dependências:
```bash
npm install
```

2. Inicie o servidor de desenvolvimento:
```bash
npm run dev
```

3. Acesse http://localhost:5000

## Segurança

- Todas as comunicações P2P são criptografadas
- Dados sensíveis são armazenados localmente de forma segura
- Chaves privadas nunca deixam o dispositivo do usuário
