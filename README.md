

Um navegador descentralizado que combina IPFS, WebRTC e criptografia para criar uma experiência de internet mais privada e segura.

## 🚀 Funcionalidades

### Navegador IPFS
- Acesso a conteúdo descentralizado via IPFS
- Proxy para sites tradicionais com modo de privacidade
- Sistema de abas e favoritos
- Navegação anônima integrada

### Chat P2P
- Comunicação direta entre usuários via WebRTC
- Criptografia ponta-a-ponta
- Lista de contatos e histórico
- Compartilhamento de arquivos direto

### Compartilhamento de Arquivos
- Upload/download via IPFS
- Biblioteca pessoal de arquivos
- Compartilhamento P2P
- Visualização integrada

### Feed de Conteúdo
- Posts armazenados no IPFS
- Sistema descentralizado
- Interface social intuitiva
- Controle total dos dados

### Gerenciador de Identidade
- Criação de identidades descentralizadas
- Gerenciamento de chaves criptográficas
- Perfil e configurações
- Backup seguro

## 🛠️ Tecnologias

### Frontend
- React + TypeScript
- Vite
- Tailwind CSS
- shadcn/ui
- WebRTC

### Backend
- Express + TypeScript
- IPFS
- SQLite + Drizzle ORM

## 📁 Estrutura

```
├── client/          # Frontend React
│   ├── src/
│   │   ├── components/  # Componentes React
│   │   ├── context/     # Contextos React
│   │   ├── hooks/       # Hooks customizados
│   │   ├── lib/         # Bibliotecas e utilidades
│   │   └── pages/       # Páginas da aplicação
├── server/          # Backend Express
└── shared/          # Schemas compartilhados
```

## 🚦 Desenvolvimento

1. Clone o repositório
```bash
git clone <repository-url>
```

2. Instale as dependências:
```bash
npm install
```

3. Inicie o servidor de desenvolvimento:
```bash
npm run dev
```

4. Acesse em http://localhost:5000

## 🔒 Segurança

- Criptografia ponta-a-ponta em todas comunicações P2P
- Dados sensíveis armazenados localmente de forma segura
- Chaves privadas nunca deixam o dispositivo
- Proxy de privacidade para sites tradicionais

## 🤝 Contribuindo

1. Faça um fork do projeto
2. Crie uma branch para sua feature
3. Commit suas mudanças
4. Push para a branch
5. Abra um Pull Request

## 📜 Licença

Este projeto está sob a licença MIT.
