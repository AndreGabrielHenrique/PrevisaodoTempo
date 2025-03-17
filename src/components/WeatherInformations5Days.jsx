// src/components/WeatherInformations5Days.jsx
import '/src/css/WeatherInformations5Days.css'

const WeatherInformations5Days = ({ weather5Days }) => {
    // Objeto para agrupar previsões por dia
    let dailyForecast = {}

    // Filtra as previsões para pegar uma por dia
    for (let forecast of weather5Days.list) {
        const date = new Date(forecast.dt * 1000).toLocaleDateString()
        if (!dailyForecast[date]) {
            dailyForecast[date] = forecast
        }
    }

    // Pega os próximos 5 dias (excluindo o dia atual)
    const next5DaysForecast = Object.values(dailyForecast).slice(1, 6)

    // Converte timestamp para formato legível
    const convertDate = (date) => {
        return new Date(date.dt * 1000).toLocaleDateString('pt-br', { 
            weekday: 'long', 
            day: '2-digit' 
        })
    }

    return (
        <div className='weather-container'>
            <h3>Previsão para os próximos cinco dias</h3>
            <div className='weather-list'>
                {next5DaysForecast.map(forecast => (
                    <div key={forecast.dt} className='weather-item'>
                        <p className='forecast-day'>{convertDate(forecast)}</p>
                        <img 
                            src={`http://openweathermap.org/img/wn/${forecast.weather[0].icon}.png`} 
                            alt="Ícone do tempo" 
                        />
                        <p className='forecast-description'>{forecast.weather[0].description}</p>
                        <p className='forecast-temperature'>
                            {Math.round(forecast.main.temp_min)}°C (min) / {Math.round(forecast.main.temp_max)}°C (max)
                        </p>
                    </div>
                ))}
            </div>
        </div>
    )
}

export default WeatherInformations5Days