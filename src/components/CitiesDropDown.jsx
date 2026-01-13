// src/components/CitiesDropDown.jsx

// Importa funções auxiliares para busca e processamento de cidades
import { fetchCities, parseCities } from '../../helpers/cities';
// Importa hooks do React para gerenciamento de estado, efeitos e referências
import { useState, useMemo, useEffect, useRef } from 'react';

// Componente de dropdown de autocompletar para seleção de cidades
// Recebe três props: inputRef (referência ao campo de input), onSelect (callback ao selecionar) e onError (callback para erros)
const CitiesDropDown = ({ inputRef, onSelect, onError }) => {
  // Estado para armazenar a lista completa de cidades carregadas da API
  const [cities, setCities] = useState([]);
  // Estado para controlar o carregamento inicial (underscore indica uso interno)
  const [_loading, _setLoading] = useState(true);
  // Estado para o texto digitado no campo de busca
  const [query, setQuery] = useState('');
  // Estado para controlar a visibilidade da lista de sugestões
  const [showSuggestions, setShowSuggestions] = useState(false);
  // Estado para o índice da cidade selecionada via teclado (setas)
  const [selectedIndex, setSelectedIndex] = useState(-1);
  // Estado para o índice da cidade sob o mouse (hover)
  const [hoverIndex, setHoverIndex] = useState(-1);
  // Referência para o elemento da lista de sugestões (para controle de cliques fora)
  const listRef = useRef();

  // Efeito para carregar a lista de cidades uma vez ao montar o componente
  useEffect(() => {
    _setLoading(true); // Ativa estado de carregamento
    fetchCities() // Busca dados da API
      .then(parseCities) // Processa e formata os dados
      .then(data => {
        setCities(data); // Armazena no estado
        _setLoading(false); // Desativa carregamento
      })
      .catch(() => {
        // Em caso de erro, define uma cidade de fallback com mensagem de erro
        setCities([{ label: 'Erro ao carregar cidades', value: '' }]);
        _setLoading(false);
      });
  }, []); // Array de dependências vazio = executa apenas no mount

  // Memoiza a lista de cidades filtradas conforme o texto digitado
  const filteredCities = useMemo(() => {
    const qTrim = query.trim(); // Remove espaços em branco
    if (!qTrim || qTrim.length < 2) return []; // Ignora buscas com menos de 2 caracteres
    
    // Normaliza a query: remove acentos e converte para minúsculas para busca case-insensitive
    const normalizedQuery = qTrim.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
    
    // Filtra cidades cujo nome normalizado contém a query normalizada
    return cities
      .filter(city => {
        const normalizedLabel = city.label.normalize('NFD')
          .replace(/[\u0300-\u036f]/g, '')
          .toLowerCase();
        return normalizedLabel.includes(normalizedQuery);
      })
      .slice(0, 50); // Limita a 50 resultados para performance
  }, [query, cities]); // Recálculo quando query ou cities mudam

  // Efeito para controlar a visibilidade da lista de sugestões
  useEffect(() => {
    // Mostra sugestões apenas se query tiver pelo menos 2 caracteres E houver cidades filtradas
    const shouldShow = query.length >= 2 && filteredCities.length > 0;
    setShowSuggestions(shouldShow);
  }, [filteredCities, query]); // Executa quando filteredCities ou query mudam

  // Função para validar o texto da query (retorna mensagem de erro ou null se válido)
  const validateQuery = (text) => {
    const trimmed = text.trim();
    if (trimmed.length < 3) {
      return 'Digite pelo menos 3 caracteres';
    }
    return null;
  };

  // Efeito para fechar o menu ao clicar fora do componente
  useEffect(() => {
    const handleClickOutside = (e) => {
      try {
        // Obtém o caminho do evento (compatível com navegadores modernos e antigos)
        const path = e.composedPath ? e.composedPath() : (e.path || []);
        // Verifica se o clique foi fora da lista ou do input
        const isOutside = !path.some(element => element === listRef.current || element === inputRef?.current);
        if (isOutside) {
          setShowSuggestions(false);
          setSelectedIndex(-1); // Reseta o índice selecionado
        }
      } catch (error) {
        console.error('Erro ao processar clique fora:', error);
        // Fallback para navegadores mais antigos: verifica containment direta
        if (!listRef.current?.contains(e.target) && e.target !== inputRef?.current) {
          setShowSuggestions(false);
          setSelectedIndex(-1);
        }
      }
    };

    // Adiciona listener para eventos de clique
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside); // Cleanup
  }, [inputRef]); // Depende de inputRef (pode mudar)

  // Efeito para rolar automaticamente para o item selecionado na lista
  useEffect(() => {
    if (selectedIndex >= 0 && listRef.current) {
      const activeItem = listRef.current.children[selectedIndex];
      if (activeItem && typeof activeItem.scrollIntoView === 'function') {
        // Rola para o item mantendo-o visível de forma eficiente (block: 'nearest')
        activeItem.scrollIntoView({
          behavior: 'auto',
          block: 'nearest'
        });
      }
    }
  }, [selectedIndex]); // Executa quando o índice selecionado muda

  // Efeito para fechar sugestões ao rolar fora da lista
  useEffect(() => {
    const handleScroll = (e) => {
      if (showSuggestions && !listRef.current?.contains(e.target)) {
        setShowSuggestions(false);
        setSelectedIndex(-1);
      }
    };
  
    window.addEventListener('scroll', handleScroll, true); // Captura fase de captura
    return () => window.removeEventListener('scroll', handleScroll, true);
  }, [showSuggestions]); // Executa quando showSuggestions muda

  // Efeito para prevenir propagação do evento wheel dentro da lista (evita scroll da página)
  useEffect(() => {
    const handleWheel = (e) => {
      if (showSuggestions && listRef.current?.contains(e.target)) {
        e.stopPropagation(); // Impede que o scroll passe para elementos pais
      }
    };
    
    document.addEventListener('wheel', handleWheel, { passive: false });
    return () => document.removeEventListener('wheel', handleWheel);
  }, [showSuggestions]);

  // Efeito para sincronizar hoverIndex e selectedIndex (seleção via mouse e teclado)
  useEffect(() => {
    if (hoverIndex !== -1 && hoverIndex !== selectedIndex) {
      setSelectedIndex(hoverIndex);
    }
  }, [hoverIndex, selectedIndex]); // Executa quando qualquer um dos índices muda

  // Função chamada ao pressionar Enter no campo de input
  const handleEnter = () => {
    if (selectedIndex >= 0) {
      // Se há um item selecionado (via setas ou hover), usa seus dados
      const city = filteredCities[selectedIndex];
      const labelTrim = city.label.trim();
      setQuery(labelTrim); // Atualiza o campo com o nome da cidade
      if (typeof city.lat === 'number' && typeof city.lon === 'number') {
        // Se tem coordenadas, passa-as no callback
        onSelect({ label: labelTrim, lat: city.lat, lon: city.lon });
      } else {
        onSelect({ label: labelTrim }); // Caso contrário, só o nome
      }
    } else {
      // Se não há item selecionado, valida o texto digitado
      const validationError = validateQuery(query);
      if (validationError) {
        if (onError) onError(validationError); // Chama callback de erro se fornecido
        return; // Interrompe a execução
      }
      // Se a query é válida, envia o texto digitado
      onSelect({ label: query.trim() });
    }
    setSelectedIndex(-1); // Reseta o índice
    setTimeout(() => setShowSuggestions(false), 120); // Fecha sugestões após breve delay
  };

  // Renderização do componente
  return (
    <div className="autocomplete-wrapper">
      {/* Campo de input principal para busca de cidades */}
      <input
        id="city-search"
        name="city"
        ref={inputRef} // Recebe a ref do componente pai para controle de foco
        type="text"
        placeholder={_loading ? 'Carregando cidades...' : 'Digite a cidade'}
        value={query}
        onChange={(e) => {
          setQuery(e.target.value); // Atualiza o estado da query
          if (e.target.value.trim().length >= 2) {
            setShowSuggestions(true); // Mostra sugestões se tiver 2+ caracteres
          }
        }}
        onFocus={() => {
          // Ao focar, mostra sugestões se já houver query e resultados
          if (query.trim().length >= 2 && filteredCities.length > 0) {
            setShowSuggestions(true);
          }
          setSelectedIndex(-1); // Reseta seleção
        }}
        onKeyDown={(e) => {
          // Manipula teclas de navegação e ação
          if (e.key === 'Enter') {
            e.preventDefault(); // Evita submit do formulário
            handleEnter(); // Processa a seleção
          } else if (e.key === 'ArrowDown') {
            e.preventDefault();
            // Move seleção para baixo (cíclico até o final)
            const newIndex = Math.min(selectedIndex + 1, filteredCities.length - 1);
            setSelectedIndex(newIndex);
            setHoverIndex(newIndex); // Sincroniza hover
            // Rola para o item se a lista estiver renderizada
            if (listRef.current?.children[newIndex]) {
              listRef.current.children[newIndex].scrollIntoView({ block: 'nearest' });
            }
          } else if (e.key === 'ArrowUp') {
            e.preventDefault();
            // Move seleção para cima (mínimo índice 0)
            const newIndex = Math.max(selectedIndex - 1, 0);
            setSelectedIndex(newIndex);
            setHoverIndex(newIndex);
            if (listRef.current?.children[newIndex]) {
              listRef.current.children[newIndex].scrollIntoView({ block: 'nearest' });
            }
          } else if (e.key === 'Escape') {
            // Fecha a lista de sugestões
            setShowSuggestions(false);
            setSelectedIndex(-1);
          }
        }}
        autoComplete="off" // Desabilita autocompletar nativo do navegador
        aria-autocomplete="none" // Atributo de acessibilidade
        onBlur={() => {
          // Ao perder o foco, fecha sugestões se o foco não foi para a lista
          if (!listRef.current?.contains(document.activeElement)) {
            setShowSuggestions(false);
            setSelectedIndex(-1);
          }
        }}
      />
      
      {/* Renderiza a lista de sugestões se estiver visível e houver resultados */}
      {showSuggestions && filteredCities.length > 0 && (
        <div 
          ref={listRef} // Referência para a lista (usada em efeitos)
          className="suggestions-list"
          onMouseDown={(e) => e.preventDefault()} // Evita perda de foco do input ao clicar
        >
          {/* Mapeia cada cidade filtrada para um item clicável */}
          {filteredCities.map(({ label, value, lat, lon }, index) => (
            <div
              key={value} // Chave única baseada no ID da cidade
              className={`suggestion-item ${index === selectedIndex || index === hoverIndex ? 'selected' : ''}`}
              onMouseEnter={() => {
                setHoverIndex(index); // Atualiza hover ao entrar com o mouse
                setSelectedIndex(index); // Sincroniza com seleção
              }}
              onMouseLeave={() => setHoverIndex(-1)} // Remove hover ao sair
              onClick={(e) => {
                e.stopPropagation(); // Evita propagação para o documento
                const labelTrim = label.trim();
                setQuery(labelTrim); // Preenche o input com o nome da cidade
                if (typeof lat === 'number' && typeof lon === 'number') {
                  onSelect({ label: labelTrim, lat, lon }); // Chama callback com coordenadas
                } else {
                  onSelect({ label: labelTrim }); // Chama callback apenas com nome
                }
                // Após seleção, fecha a lista e devolve foco ao input
                setTimeout(() => {
                  setSelectedIndex(-1);
                  setShowSuggestions(false);
                  inputRef.current?.focus();
                }, 120);
              }}
            >
              {/* Layout interno do item: nome da cidade e espaço para informação adicional */}
              <div style={{display: 'flex', justifyContent: 'space-between', gap: 8}}>
                <span>{label}</span>
                <small style={{color: '#666'}}></small> {/* Pode ser usado para estado/sigla */}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default CitiesDropDown;