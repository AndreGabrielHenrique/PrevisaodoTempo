// src/hooks/useWeather.jsx

// Importa hooks do React para gerenciamento de estado, efeitos e memoização
import { useState, useCallback, useMemo, useRef, useEffect } from 'react';
// Importa axios para requisições HTTP
import axios from 'axios';

// Hook customizado que centraliza toda a lógica de busca e gerenciamento de dados meteorológicos
const useWeather = () => {
  // Estado para armazenar dados do tempo atual
  const [weather, setWeather] = useState(null);
  // Estado para armazenar previsão dos próximos 5 dias
  const [weather5Days, setWeather5Days] = useState(null);
  // Estado para controlar carregamento (loading)
  const [loading, setLoading] = useState(false);
  // Estado para armazenar mensagens de erro (usando _setError para distinguir da função personalizada)
  const [error, _setError] = useState(null);
  // Referência para armazenar o timeout de limpeza automática de erros
  const errorTimeoutRef = useRef(null);

  // Obtém a chave da API OpenWeatherMap das variáveis de ambiente
  const key = import.meta.env.VITE_OPENWEATHER_API_KEY;

  // Função personalizada para setar erros com timeout automático de 5 segundos
  const setError = useCallback((message) => {
    // Limpa timeout anterior se existir (para evitar múltiplos timers concorrentes)
    if (errorTimeoutRef.current) {
      clearTimeout(errorTimeoutRef.current);
      errorTimeoutRef.current = null;
    }
    
    // Define o erro no estado
    _setError(message);
    
    // Configura timeout para limpar o erro após 5 segundos, apenas se houver mensagem
    if (message) {
      errorTimeoutRef.current = setTimeout(() => {
        _setError(null);
        errorTimeoutRef.current = null;
      }, 5000);
    }
  }, []); // useCallback sem dependências: função estável

  // Efeito de cleanup para limpar timeout quando o componente que usa o hook desmontar
  useEffect(() => {
    return () => {
      if (errorTimeoutRef.current) {
        clearTimeout(errorTimeoutRef.current);
      }
    };
  }, []); // Executa apenas no mount/unmount

  // Memoiza um objeto de mapeamento de nomes completos de estados para siglas
  const stateAbbr = useMemo(() => ({
    'Acre': 'AC','Alagoas':'AL','Amapá':'AP','Amazonas':'AM','Bahia':'BA','Ceará':'CE','Distrito Federal':'DF','Espírito Santo':'ES','Goiás':'GO','Maranhão':'MA','Mato Grosso':'MT','Mato Grosso do Sul':'MS','Minas Gerais':'MG','Pará':'PA','Paraíba':'PB','Paraná':'PR','Pernambuco':'PE','Piauí':'PI','Rio de Janeiro':'RJ','Rio Grande do Norte':'RN','Rio Grande do Sul':'RS','Rondônia':'RO','Roraima':'RR','Santa Catarina':'SC','São Paulo':'SP','Sergipe':'SE','Tocantins':'TO'
  }), []); // Array vazio: objeto criado apenas uma vez

  // Função que verifica se um nome corresponde a um município válido do IBGE no estado informado
  const isMunicipality = useCallback(async (name, stateAbbreviation) => {
    try {
      // Busca municípios pelo nome na API do IBGE
      const res = await axios.get(`https://servicodados.ibge.gov.br/api/v1/localidades/municipios?nome=${encodeURIComponent(name)}`);
      const items = Array.isArray(res.data) ? res.data : [];
      // Procura um município com nome exato (case-insensitive) e, se fornecido, sigla de estado correspondente
      const found = items.find(item => {
        const sigla = item?.microrregiao?.mesorregiao?.UF?.sigla;
        return item.nome.toLowerCase() === name.toLowerCase() && (!stateAbbreviation || sigla === stateAbbreviation);
      });
      return !!found; // Retorna true se encontrou, false caso contrário
    } catch {
      return false; // Em caso de erro na requisição, retorna false
    }
  }, []); // Sem dependências: função estável

  // Função para buscar dados meteorológicos por coordenadas geográficas (latitude e longitude)
  const searchByCoordinates = useCallback(async (lat, lon, prettyName = null) => {
    // Converte strings com vírgula para ponto flutuante, se necessário
    lat = typeof lat === 'string' ? parseFloat(lat.replace(',', '.')) : lat;
    lon = typeof lon === 'string' ? parseFloat(lon.replace(',', '.')) : lon;

    // Validação numérica básica
    if (isNaN(lat) || isNaN(lon)) {
      setError('Coordenadas inválidas');
      return;
    }
    
    // Função auxiliar para validar intervalo de coordenadas
    const isValid = (coord, min, max) => 
    typeof coord === 'number' && !isNaN(coord) && coord >= min && coord <= max;
  
    // Valida se as coordenadas estão dentro dos limites aproximados do Brasil
    if (!isValid(lat, -33.75, 5.27) || !isValid(lon, -73.99, -34.79)) {
      setError('Localização inválida para consulta');
      return;
    }
    // Verificação adicional de fronteiras do território brasileiro
    if (lat < -33.75 || lat > 5.27 || lon < -73.99 || lon > -34.79) {
      setError('Localização fora do território brasileiro');
      return;
    }
    // Garante que são números
    if (typeof lat !== 'number' || typeof lon !== 'number') {
      setError('Coordenadas inválidas');
      return;
    }
    
    // Inicia estado de carregamento e limpa erros anteriores
    setLoading(true);
    setError(null);
    
    try {
      // Faz duas requisições paralelas: clima atual e previsão para 5 dias
      const [current, forecast] = await Promise.all([
        axios.get(`https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${key}&lang=pt_br&units=metric`),
        axios.get(`https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&appid=${key}&lang=pt_br&units=metric`)
      ]);

      // Se um prettyName foi fornecido (ex: de uma seleção de lista), usa-o
      if (prettyName) {
        const currentWithName = { ...current.data, cityName: prettyName };
        const forecastWithCity = { ...forecast.data, city: { ...forecast.data.city, name: prettyName } };
        setWeather(currentWithName);
        setWeather5Days(forecastWithCity);
        return;
      }

      // Caso nenhum prettyName fornecido, tenta reverse-geocoding para obter nome da localização
      try {
        const geoRes = await axios.get(`https://api.openweathermap.org/geo/1.0/reverse?lat=${lat}&lon=${lon}&limit=10&appid=${key}`);
          const places = Array.isArray(geoRes.data) ? geoRes.data : [];

          // Tenta encontrar um lugar que seja um município IBGE válido
          let selected = null;
          for (const p of places) {
            if (p.country !== 'BR') continue; // Filtra apenas localidades no Brasil
            const abbr = p.state ? (stateAbbr[p.state] || p.state) : null; // Obtém sigla do estado
            const isMun = await isMunicipality(p.name, abbr); // Verifica se é município
            if (isMun) {
              selected = { p, abbr };
              break; // Para no primeiro município válido encontrado
            }
          }

          // Fallback: se nenhum município encontrado, tenta uma escolha heurística
          if (!selected) {
            // Prefere lugares com estado definido, depois qualquer lugar no BR, depois o primeiro resultado
            let p = places.find(x => x.country === 'BR' && x.state) || places.find(x => x.country === 'BR') || places[0];
            if (p) {
              const abbr = p.state ? (stateAbbr[p.state] || p.state) : null;
              const isMun = await isMunicipality(p.name, abbr);
              if (isMun) selected = { p, abbr };
            }
          }

          // Se encontrou um município válido, formata o nome com a sigla do estado
          if (selected) {
            const { p, abbr } = selected;
            const pretty = abbr ? `${p.name} - ${abbr}` : p.name;
            const currentWithName = { ...current.data, cityName: pretty };
            const forecastWithCity = { ...forecast.data, city: { ...forecast.data.city, name: pretty } };
            setWeather(currentWithName);
            setWeather5Days(forecastWithCity);
          } else {
            // Se não encontrou município válido, usa os dados da API sem nome personalizado (evita expor bairros)
            setWeather(current.data);
            setWeather5Days(forecast.data);
          }
      } catch {
        // Em caso de erro no reverse-geocoding, usa os dados brutos da API
        setWeather(current.data);
        setWeather5Days(forecast.data);
      }
    } catch (error) {
      // Em caso de erro nas requisições principais, define mensagem de erro apropriada
      setError(error.response?.data?.message || 'Erro ao buscar dados');
    } finally {
      // Finaliza o estado de carregamento independentemente de sucesso ou erro
      setLoading(false);
    }
  }, [key, isMunicipality, stateAbbr, setError]); // Dependências: recria função quando estas mudam

  // Função para buscar dados meteorológicos pelo nome da cidade
  const searchCityByName = useCallback(async (cityName) => {
    // Validação básica: nome deve ter pelo menos 3 caracteres
    if (!cityName || cityName.trim().length < 3) {
      setError('Digite pelo menos 3 caracteres');
      return;
    }
    
    // Inicia carregamento e limpa erros
    setLoading(true);
    setError(null);
    
    try {
      // Geocoding direto: busca coordenadas pelo nome da cidade (limitado ao Brasil)
      const q = encodeURIComponent(`${cityName},BR`);
      const geoRes = await axios.get(`https://api.openweathermap.org/geo/1.0/direct?q=${q}&limit=10&appid=${key}`);
      const places = Array.isArray(geoRes.data) ? geoRes.data : [];

      // Expressão regular para filtrar resultados indesejados (bairros, distritos, etc.)
      const badRe = /bairro|distrito|zona|região|vila|rua|avenida|quadra/gi;
      const nameLower = cityName.toLowerCase();

      // Heurística de prioridade para escolher o melhor resultado:
      // 1. Nome exato + estado presente + não é "bad"
      let place = places.find(p => p.country === 'BR' && p.name.toLowerCase() === nameLower && p.state && !badRe.test(p.name));
      // 2. Começa com o nome + não é "bad"
      if (!place) place = places.find(p => p.country === 'BR' && p.name.toLowerCase().startsWith(nameLower) && !badRe.test(p.name));
      // 3. Qualquer lugar no BR que não seja "bad"
      if (!place) place = places.find(p => p.country === 'BR' && !badRe.test(p.name));
      // 4. Primeiro resultado (fallback)
      if (!place) place = places[0];

      // Se encontrou um lugar com coordenadas, verifica se é município válido
      if (place && place.lat && place.lon) {
        const abbr = place.state ? (stateAbbr[place.state] || place.state) : null;
        const isMun = await isMunicipality(place.name, abbr);
        if (!isMun) {
          throw new Error('Cidade não encontrada (possível bairro)');
        }
        // Formata nome com sigla do estado e chama searchByCoordinates com as coordenadas
        const pretty = abbr ? `${place.name} - ${abbr}` : place.name;
        return searchByCoordinates(place.lat, place.lon, pretty);
      }

      throw new Error('Cidade não encontrada');
      
    } catch (error) {
      // Define erro: prioriza mensagem da API, fallback para mensagem genérica
      setError(error.response?.data?.message || 'Cidade não encontrada');
    } finally {
      setLoading(false);
    }
  }, [key, searchByCoordinates, isMunicipality, stateAbbr, setError]); // Dependências

  // Retorna um objeto com estados e funções para uso em componentes
  return {
    weather,             // Dados do tempo atual
    weather5Days,        // Previsão para 5 dias
    loading,             // Boolean de carregamento
    error,               // Mensagem de erro (ou null)
    setError,            // Função para definir erro manualmente (com timeout)
    searchByCoordinates, // Função para buscar por coordenadas
    searchCityByName     // Função para buscar por nome de cidade
  };
};

export default useWeather;