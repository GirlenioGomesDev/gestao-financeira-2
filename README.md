# 📓 Meu Diário Financeiro

Aplicativo de gestão financeira pessoal para famílias brasileiras, construído com React Native + Expo. Funciona 100% offline — nenhum dado sai do dispositivo.

## 🛠 Tecnologias

- **React Native** + **Expo SDK 54**
- **Expo Router v6** (navegação baseada em arquivos)
- **NativeWind v4** (Tailwind CSS para React Native)
- **Zustand** (estado global)
- **expo-sqlite** (persistência local)
- **React Hook Form** + **Zod** (formulários e validação)
- **TypeScript 5.9**

## 📁 Estrutura de pastas

```text
/
├── app/              # Rotas (Expo Router — cada arquivo = uma tela)
├── src/
│   ├── components/   # Componentes reutilizáveis
│   ├── database/     # SQLite — inicialização e hooks
│   ├── store/        # Zustand stores
│   ├── hooks/        # Hooks customizados
│   ├── utils/        # Funções auxiliares
│   └── types/        # Tipos TypeScript compartilhados
├── assets/           # Ícones, splash screen, fontes
├── app.json          # Configuração Expo
└── package.json
```

## Desenvolvimento

```bash
npm install
npm start
```

Use `npm run typecheck`, `npm run lint` e `npm run format:check` para verificar o projeto.

## Assets pendentes

Os arquivos abaixo estão referenciados no `app.json`, mas ainda precisam ser criados:

- `assets/splash.png`
- `assets/icon.png`
- `assets/adaptive-icon.png`
- `assets/notification-icon.png`
