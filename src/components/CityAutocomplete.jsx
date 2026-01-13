// src/components/CityAutocomplete.jsx

// Importa hooks do React e componentes para lista virtualizada
import { useState, useMemo, useEffect, useRef } from 'react';
import { FixedSizeList as List } from 'react-window'; // Lista de alto desempenho para muitos itens
import { inflate } from 'pako'; // Biblioteca para descompressão GZIP

// Componente alternativo de autocompletar que carrega cidades de arquivo JSON compactado
// Recebe três props: inputRef (referência ao input), onSelect (callback de seleção) e onSearch (callback de busca)
const CityAutocomplete = ({ inputRef, onSelect, onSearch }) => {
  // Estado para o texto digitado no campo de busca
  const [query, setQuery] = useState('');
  // Estado para armazenar a lista completa de cidades (carregada de arquivo)
  const [cities, setCities] = useState([]);
  // Estado para controlar carregamento do arquivo (underscore indica uso interno)
  const [_loading, _setLoading] = useState(true);
  // Estado para controlar visibilidade da lista de sugestões
  const [showSuggestions, setShowSuggestions] = useState(false);
  // Referência para o elemento da lista de sugestões
  const listRef = useRef();

  // Efeito para carregar o arquivo de cidades compactado ao montar o componente
  useEffect(() => {
    const loadCities = async () => {
      try {
        // Faz fetch do arquivo GZIP contendo as cidades
        const response = await fetch('/cidades.json.gz');
        if (!response.ok) throw new Error(`Erro HTTP: ${response.status}`);
        
        // Converte a resposta para ArrayBuffer (dados binários)
        const compressed = await response.arrayBuffer();
        
        // Descomprime os dados usando a biblioteca pako (GZIP)
        const decompressed = inflate(new Uint8Array(compressed), { 
          to: 'string', // Saída como string
          windowBits: 15 + 16 // Configuração para modo automático GZIP
        });
  
        // Valida se o conteúdo descomprimido começa com array JSON
        if (!decompressed.startsWith('[{')) {
          throw new Error('Formato JSON inválido');
        }
  
        // Parse do JSON e armazenamento no estado
        const data = JSON.parse(decompressed);
        console.log('Cidades carregadas:', data.length);
        setCities(data);
  
      } catch (error) {
        console.error('Erro crítico:', error);
        // Fallback: define algumas cidades para teste caso o carregamento falhe
        setCities([
          {name: 'São Paulo', state: 'SP', country: 'BR', lat: -23.5505, lon: -46.6333},
          {name: 'Rio de Janeiro', state: 'RJ', country: 'BR', lat: -22.9068, lon: -43.1729}
        ]);
      }
    };
    loadCities();
  }, []); // Executa apenas no mount

  // Memoiza a lista de cidades filtradas conforme o texto digitado
  const filteredCities = useMemo(() => {
    if (!query || query.length < 2) return []; // Filtra apenas com 2+ caracteres
    const searchTerm = query.toLowerCase();
    return cities
      .filter(city => city.name.toLowerCase().includes(searchTerm)) // Busca case-insensitive
      .slice(0, 100); // Limita a 100 resultados para performance
  }, [query, cities]); // Recálculo quando query ou cities mudam

  // Efeito para controlar a visibilidade da lista de sugestões
  useEffect(() => {
    const shouldShow = filteredCities.length > 0 && query.length >= 2;
    console.log('Mostrar menu?', shouldShow, 'Cidades:', filteredCities.length); // Log de debug
    setShowSuggestions(shouldShow);
  }, [filteredCities, query]);

  // Efeito para fechar o menu ao clicar fora do componente
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (listRef.current && 
          !listRef.current.contains(e.target) && 
          e.target !== inputRef.current) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [inputRef]); // Depende de inputRef

  // Componente de linha para a lista virtualizada (renderizado para cada item)
  const Row = ({ index, style }) => {
    const city = filteredCities[index]; // Obtém a cidade correspondente ao índice
    return (
      <div 
        style={style} // Estilo posicional fornecido pelo react-window
        className="suggestion-item"
        onClick={() => {
          inputRef.current.value = city.name; // Preenche o input
          onSelect(city); // Chama callback de seleção
          setShowSuggestions(false); // Fecha a lista
        }}
      >
        {city.name}, {city.state} - {city.country} {/* Formato: Nome, Estado - País */}
      </div>
    );
  };

  return (
    <div className="autocomplete-wrapper">
      {/* Campo de input principal */}
      <input
        ref={inputRef}
        type="text"
        placeholder={_loading ? 'Carregando cidades...' : 'Digite a cidade'}
        value={query}
        onChange={(e) => setQuery(e.target.value)} // Atualiza query
        onKeyDown={(e) => e.key === 'Enter' && onSearch(query)} // Enter chama busca
        onFocus={() => query.length >= 2 && setShowSuggestions(true)} // Foco mostra sugestões se houver query
      />

      {console.log('Estado do menu:', showSuggestions)} {/* Log de debug */}
      
      {/* Renderiza lista virtualizada se sugestões estiverem visíveis */}
      {showSuggestions && (
        <div ref={listRef}>
          <List
            height={Math.min(200, filteredCities.length * 35)} // Altura dinâmica (máx 200px)
            itemCount={filteredCities.length} // Número total de itens
            itemSize={35} // Altura fixa de cada linha
            width={inputRef.current?.offsetWidth || 400} // Largura igual à do input ou padrão
            style={{
              position: 'absolute',
              zIndex: 1000, // Garante sobreposição
              backgroundColor: 'white',
              boxShadow: '0 4px 8px rgba(0,0,0,0.1)', // Sombra para destaque
              top: '110%' // Posiciona logo abaixo do input
            }}
          >
            {Row} // Componente de linha para renderização
          </List>
        </div>
      )}
    </div>
  );
};

export default CityAutocomplete;