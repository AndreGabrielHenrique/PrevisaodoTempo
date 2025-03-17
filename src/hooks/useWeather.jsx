// src/hooks/useWeather.js
import { useState } from 'react'
import axios from 'axios'

const useWeather = () => {
    // Estados para armazenar dados do clima
    const [weather, setWeather] = useState(null)
    const [weather5Days, setWeather5Days] = useState(null)
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState(null)

    // Função para buscar dados da cidade
    const searchCity = async (city) => {
        setLoading(true)
        setError(null)

        try {
            const key = '471c9b9c0390b7986bde02dd6a27e193'
            // URLs para as APIs de clima atual e previsão
            const url = `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${key}&lang=pt_br&units=metric`
            const url5Days = `https://api.openweathermap.org/data/2.5/forecast?q=${city}&appid=${key}&lang=pt_br&units=metric`

            // Faz ambas as requisições simultaneamente
            const [apiInfo, apiInfo5Days] = await Promise.all([
                axios.get(url),
                axios.get(url5Days),
            ])

            // Atualiza estados com os dados recebidos
            setWeather(apiInfo.data)
            setWeather5Days(apiInfo5Days.data)
        } catch (err) {
            setError(err.message)
        } finally {
            setLoading(false)
        }
    }

    return { weather, weather5Days, loading, error, searchCity }
}

export default useWeather