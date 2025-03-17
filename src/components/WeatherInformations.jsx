// src/components/WeatherInformations.jsx
import '/src/css/WeatherInformations.css'

const WeatherInformations = ({ weather }) => {
    // Gera URL do ícone do tempo usando o código da API
    const weatherImg = `http://openweathermap.org/img/wn/${weather.weather[0].icon}.png`

    return (
        <div className='weather-container'>
            {/* Nome da cidade */}
            <h2>{weather.name}</h2>

            <div className='weather-info'>
                {/* Exibe ícone e temperatura atual */}
                <img src={weatherImg} alt="Ícone do tempo" />
                <p className='temperature'>{Math.round(weather.main.temp)}°C</p>
            </div>

            {/* Descrição textual das condições atuais */}
            <p className='description'>{weather.weather[0].description}</p>

            {/* Detalhes adicionais do clima */}
            <div className='details'>
                <p>Sensação Térmica: {Math.round(weather.main.feels_like)}°C</p>
                <p>Umidade: {weather.main.humidity}%</p>
                <p>Pressão: {weather.main.pressure}</p>
            </div>
        </div>
    )
}

export default WeatherInformations