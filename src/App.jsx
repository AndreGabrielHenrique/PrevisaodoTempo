import { useRef } from 'react'
import './css/App.css'
import WeatherInformations from './components/WeatherInformations'
import WeatherInformations5Days from './components/WeatherInformations5Days'
import useWeather from './hooks/useWeather'

const App = () => {
  // Referência para o input de busca
  const inputRef = useRef()
  
  // Custom hook para gerenciar o estado do clima
  const { weather, weather5Days, loading, error, searchCity } = useWeather()

  // Manipulador de busca
  const handleSearch = () => {
    const city = inputRef.current.value
    if (city) {
      searchCity(city)
    }
  }

  // Função para detectar a tecla "Enter" no input
  const handleKeyDown = (event) => {
    if (event.key === 'Enter') {
      handleSearch() // Chama a função de busca ao pressionar Enter
    }
  }

  return (
    <div className='container'>
      <h1>Previsão do Tempo</h1>
      
      {/* Campo de entrada e botão de busca */}
      <input 
        type='text' 
        placeholder='Digite o nome da cidade' 
        ref={inputRef} 
        onKeyDown={handleKeyDown} // Adiciona o event listener para a tecla "Enter"
      />
      <button onClick={handleSearch}>Buscar</button>

      {/* Estados de carregamento e erro */}
      {loading && <p className='weather-loading'>Carregando...</p>}
      {error && <p className='weather-error'>{error}</p>}

      {/* Exibe componentes apenas quando os dados estiverem disponíveis */}
      {weather && <WeatherInformations weather={weather} />}
      {weather5Days && <WeatherInformations5Days weather5Days={weather5Days} />}
    </div>
  )
}

export default App