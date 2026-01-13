// src/components/WeatherInformations.jsx

// Importa estilos específicos do componente
import '/src/sass/WeatherInformations.sass'

// Componente para exibir informações meteorológicas atuais
// Recebe uma prop: weather (objeto com dados da API OpenWeatherMap)
const WeatherInformations = ({ weather }) => {
    // Gera URL do ícone do tempo usando o código fornecido pela API
    const weatherImg = `http://openweathermap.org/img/wn/${weather.weather[0].icon}.png`

    return (
            <div className='weather-container'>
                {/* Nome da cidade: usa cityName se fornecido pelo hook, caso contrário usa name da API */}
                <h2>{weather.cityName || weather.name}</h2>

            <div className='weather-info'>
                {/* Exibe ícone do tempo e temperatura atual arredondada */}
                <img src={weatherImg} alt="Ícone do tempo" />
                <p className='temperature'>{Math.round(weather.main.temp)}°C</p>
            </div>

            {/* Descrição textual das condições atuais (capitalizada) */}
            <p className='description'>{weather.weather[0].description}</p>

            {/* Detalhes adicionais do clima: sensação térmica, umidade e pressão */}
            <div className='details'>
                <p>Sensação Térmica: {Math.round(weather.main.feels_like)}°C</p>
                <p>Umidade: {weather.main.humidity}%</p>
                <p>Pressão: {weather.main.pressure}</p>
            </div>
        </div>
    )
}

export default WeatherInformations