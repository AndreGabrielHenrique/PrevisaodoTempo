// eslint.config.js
// Configuração do ESLint para linting do código (padrões e boas práticas)

// Importa configurações recomendadas do ESLint para JavaScript
import js from '@eslint/js'
// Importa globais padrão do navegador e Node.js
import globals from 'globals'
// Importa plugin do React para regras de hooks
import reactHooks from 'eslint-plugin-react-hooks'
// Importa plugin para Fast Refresh do React (recarregamento rápido em desenvolvimento)
import reactRefresh from 'eslint-plugin-react-refresh'

// Exporta array de configurações (cada objeto é uma configuração para um conjunto de arquivos)
export default [
  { ignores: ['dist'] }, // Ignora o diretório dist (build) no linting
  
  {
    files: ['**/*.{js,jsx}'], // Aplica estas regras a todos os arquivos .js e .jsx
    languageOptions: {
      ecmaVersion: 2020, // Versão do ECMAScript (ES2020)
      globals: {
        ...globals.browser, // Adiciona globais do navegador (window, document, etc.)
        ...globals.node, // Adiciona globais do Node.js (process, etc.)
      },
      parserOptions: {
        ecmaVersion: 'latest', // Usa a versão mais recente do ECMAScript para parsing
        ecmaFeatures: { jsx: true }, // Habilita parsing de JSX
        sourceType: 'module', // Usa módulos ES6
      },
    },
    plugins: {
      'react-hooks': reactHooks, // Registra o plugin de React Hooks
      'react-refresh': reactRefresh, // Registra o plugin de Fast Refresh
    },
    rules: {
      ...js.configs.recommended.rules, // Herda regras recomendadas do ESLint
      ...reactHooks.configs.recommended.rules, // Herda regras recomendadas de React Hooks
      'no-unused-vars': ['error', { varsIgnorePattern: '^[A-Z_]' }], // Erro para variáveis não usadas, exceto constantes em maiúsculo
      'react-refresh/only-export-components': [
        'warn', // Apenas warning (não erro) para permitir export de constantes
        { allowConstantExport: true },
      ],
    },
  },
]