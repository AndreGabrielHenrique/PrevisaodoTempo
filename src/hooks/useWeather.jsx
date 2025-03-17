// src/hooks/useWeather.js
import { useState } from 'react'
import axios from 'axios'

const useWeather = () => {
    const [weather, setWeather] = useState(null)
    const [weather5Days, setWeather5Days] = useState(null)
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState(null)

    const key = '471c9b9c0390b7986bde02dd6a27e193'

    // Função genérica para buscar dados
    const fetchWeatherData = async (url, url5Days) => {
        try {
            const [apiInfo, apiInfo5Days] = await Promise.all([
                axios.get(url),
                axios.get(url5Days),
            ])

            setWeather(apiInfo.data)
            setWeather5Days(apiInfo5Days.data)
        } catch (err) {
            setError(err.response?.data?.message || err.message)
        } finally {
            setLoading(false)
        }
    }

    // Buscar por cidade
    const searchCity = async (city) => {
        setLoading(true)
        setError(null)
        
        const url = `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${key}&lang=pt_br&units=metric`
        const url5Days = `https://api.openweathermap.org/data/2.5/forecast?q=${city}&appid=${key}&lang=pt_br&units=metric`
        
        await fetchWeatherData(url, url5Days)
    }

    // Buscar por coordenadas
    const searchByCoords = async (lat, lon) => {
        setLoading(true)
        setError(null)
        
        const url = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${key}&lang=pt_br&units=metric`
        const url5Days = `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&appid=${key}&lang=pt_br&units=metric`
        
        await fetchWeatherData(url, url5Days)
    }

    return { weather, weather5Days, loading, error, searchCity, searchByCoords }
}

export default useWeather