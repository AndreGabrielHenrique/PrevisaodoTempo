// src/App.jsx

// Importa hooks do React para efeitos e referências
import { useEffect, useRef } from 'react';
// Importa estilos globais e de componentes específicos
import './sass/index.sass';
import './sass/App.sass';
import './sass/CitiesDropDown.sass';
// Importa componentes de exibição de dados meteorológicos
import WeatherInformations from './components/WeatherInformations';
import WeatherInformations5Days from './components/WeatherInformations5Days';
// Importa hook customizado que gerencia toda a lógica de busca de clima
import useWeather from './hooks/useWeather';
// Importa componente de dropdown de seleção de cidades
import CitiesDropDown from './components/CitiesDropDown';

// Componente principal da aplicação
const App = () => {
  // Desestrutura o retorno do hook useWeather para obter estados e funções
  const { 
    weather,              // Dados do tempo atual
    weather5Days,         // Previsão para 5 dias
    loading,              // Boolean de carregamento
    error,                // Mensagem de erro (ou null)
    setError,             // Função para definir erro (com timeout de 5s)
    searchByCoordinates,  // Função para buscar clima por coordenadas
    searchCityByName      // Função para buscar clima por nome de cidade
  } = useWeather();

  // Cria uma referência para o elemento input do dropdown (para controle de foco e valor)
  const inputRef = useRef();

  // Efeito para geolocalização do usuário ao montar o componente
  useEffect(() => {
    const getLocation = () => {
      // Fallback: coordenadas de São Paulo caso a geolocalização falhe
      const fallbackSP = () => searchByCoordinates(-23.533773, -46.625290);
      
      if (navigator.geolocation) {
        // Tenta obter a localização atual do usuário
        navigator.geolocation.getCurrentPosition(
          ({ coords }) => {
            const { latitude, longitude } = coords;
            searchByCoordinates(latitude, longitude); // Busca clima para as coordenadas
          },
          (error) => {
            console.error('Erro de geolocalização:', error);
            fallbackSP(); // Em caso de erro, usa São Paulo como fallback
          }
        );
      } else {
        // Se o navegador não suporta geolocalização, usa fallback
        fallbackSP();
      }
    };
    getLocation();
  }, [searchByCoordinates]); // Executa apenas uma vez (no mount) e quando searchByCoordinates mudar

  // Função chamada ao clicar no botão "Buscar"
  const handleSearch = () => {
    const value = inputRef.current?.value?.trim(); // Obtém e limpa o valor do input
    
    // Validações básicas antes de buscar
    if (!value) {
      setError('Digite o nome de uma cidade');
      return;
    }
    
    if (value.length < 3) {
      setError('Digite pelo menos 3 caracteres');
      return;
    }
    
    // Limpa qualquer erro anterior antes de tentar nova busca
    setError(null);
    
    // Chama a função de busca por nome de cidade
    searchCityByName(value);
  };

  // Renderização da aplicação
  return (
    <div className='container'>
      <h1>Previsão do Tempo</h1>
  
      {/* Container de busca: input dropdown + botão */}
      <div className="search-container">
        {/* Componente de dropdown de cidades com autocompletar */}
        <CitiesDropDown
          inputRef={inputRef} // Passa a ref para controle interno
          onSelect={(city) => {
            // Callback chamado quando uma cidade é selecionada na lista
            if (city.lat && city.lon) {
              // Se a cidade tem coordenadas, busca por coordenadas
              searchByCoordinates(city.lat, city.lon);
            } else {
              // Caso contrário, busca por nome (fallback)
              searchCityByName(city.label);
            }
          }}
          onError={setError} // Passa a função setError para validações internas do dropdown
        />
        {/* Botão de busca manual */}
        <button onClick={handleSearch}>
          Buscar
        </button>
      </div>

      {/* Exibe mensagem de carregamento enquanto busca dados */}
      {loading && <p className='weather-loading'>Carregando...</p>}
      {/* Exibe mensagem de erro se existir (desaparece após 5s automaticamente) */}
      {error && <p className='weather-error'>Erro: {error}</p>}

      {/* Renderiza componente de clima atual se houver dados */}
      {weather && <WeatherInformations weather={weather} />}
      {/* Renderiza componente de previsão 5 dias se houver dados */}
      {weather5Days && <WeatherInformations5Days weather5Days={weather5Days} />}
    </div>
  );
};

export default App;