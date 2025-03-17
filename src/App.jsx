import { useRef, useEffect } from 'react'
import './css/App.css'
import WeatherInformations from './components/WeatherInformations'
import WeatherInformations5Days from './components/WeatherInformations5Days'
import useWeather from './hooks/useWeather'

const App = () => {
    const inputRef = useRef()
    const { weather, weather5Days, loading, error, searchCity, searchByCoords } = useWeather()

    // Efeito para carregar a localização inicial
    useEffect(() => {
        const getLocation = () => {
            if (navigator.geolocation) {
                navigator.geolocation.getCurrentPosition(
                    (position) => {
                        searchByCoords(
                            position.coords.latitude,
                            position.coords.longitude
                        )
                    },
                    (error) => {
                        console.error('Erro ao obter localização:', error)
                        searchCity('São Paulo') // Fallback para uma cidade padrão
                    }
                )
            } else {
                searchCity('São Paulo') // Fallback se geolocalização não for suportada
            }
        }

        getLocation()
    }, []) // eslint-disable-line react-hooks/exhaustive-deps

    const handleSearch = () => {
        const city = inputRef.current.value
        if (city) {
            searchCity(city)
        }
    }

    const handleKeyDown = (event) => {
        if (event.key === 'Enter') {
            handleSearch()
        }
    }

    return (
        <div className='container'>
            <h1>Previsão do Tempo</h1>
            
            <input 
                type='text' 
                placeholder='Digite o nome da cidade' 
                ref={inputRef} 
                onKeyDown={handleKeyDown}
            />
            <button onClick={handleSearch}>Buscar</button>

            {loading && <p className='weather-loading'>Carregando...</p>}
            {error && <p className='weather-error'>{error}</p>}

            {weather && <WeatherInformations weather={weather} />}
            {weather5Days && <WeatherInformations5Days weather5Days={weather5Days} />}
        </div>
    )
}

export default App