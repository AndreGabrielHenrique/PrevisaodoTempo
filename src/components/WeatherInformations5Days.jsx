// src/components/WeatherInformations5Days.jsx

// Importa estilos específicos do componente
import '/src/sass/WeatherInformations5Days.sass'

// Componente para exibir previsão do tempo para os próximos 5 dias
// Recebe uma prop: weather5Days (objeto com dados de previsão da API OpenWeatherMap)
const WeatherInformations5Days = ({ weather5Days }) => {
    // Objeto para agrupar previsões por data (chave: string de data)
    let dailyForecast = {}

    // Itera sobre a lista de previsões (intervalo de 3 horas) e agrupa por dia
    for (let forecast of weather5Days.list) {
        const date = new Date(forecast.dt * 1000).toLocaleDateString() // Converte timestamp para data legível
        if (!dailyForecast[date]) {
            dailyForecast[date] = forecast // Armazena a primeira previsão de cada dia
        }
    }

    // Pega os próximos 5 dias (excluindo o dia atual) a partir do segundo dia
    const next5DaysForecast = Object.values(dailyForecast).slice(1, 6)

    // Função auxiliar para converter timestamp em formato de data amigável
    const convertDate = (date) => {
        return new Date(date.dt * 1000).toLocaleDateString('pt-br', { 
            weekday: 'long',  // Dia da semana por extenso
            day: '2-digit'    // Dia do mês com dois dígitos
        })
    }

    return (
        <div className='weather-container'>
            <h3>Previsão para os próximos cinco dias</h3>
            <div className='weather-list'>
                {/* Mapeia cada previsão diária para um card */}
                {next5DaysForecast.map(forecast => (
                    <div key={forecast.dt} className='weather-item'>
                        {/* Dia da semana e data */}
                        <p className='forecast-day'>{convertDate(forecast)}</p>
                        {/* Ícone do tempo para o dia */}
                        <img 
                            src={`http://openweathermap.org/img/wn/${forecast.weather[0].icon}.png`} 
                            alt="Ícone do tempo" 
                        />
                        {/* Descrição das condições (capitalizada) */}
                        <p className='forecast-description'>{forecast.weather[0].description}</p>
                        {/* Temperaturas mínima e máxima arredondadas */}
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