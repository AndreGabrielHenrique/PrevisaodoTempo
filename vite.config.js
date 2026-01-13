// vite.config.js
// Configuração do Vite (build tool e dev server)

// Importa a função defineConfig do Vite para tipagem e autocompletar
import { defineConfig } from 'vite';
// Importa o plugin oficial do React para Vite
import react from '@vitejs/plugin-react';

// Exporta a configuração como um objeto (usando defineConfig para intellisense)
export default defineConfig({
  plugins: [react()], // Habilita o plugin do React
  assetsInclude: ['**/*.gz'], // Indica ao Vite para tratar arquivos .gz como assets (importáveis)
  // Isso é necessário para o componente CityAutocomplete carregar o arquivo cidades.json.gz
});