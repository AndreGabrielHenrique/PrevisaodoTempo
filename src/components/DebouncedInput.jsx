// src/components/DebouncedInput.jsx

// Importa hooks do React para gerenciamento de estado e efeitos
import { useEffect, useState } from 'react'
// Importa estilos específicos do componente
import '../sass/DebouncedInput.sass'

// Componente de input com debounce (atraso) para evitar chamadas excessivas durante digitação
// Recebe props: value (valor inicial), onChange (callback quando valor estabilizar), debounce (tempo em ms) e outras props padrão de input
const DebouncedInput = ({ value, onChange, debounce = 300, ...props }) => {
    // Estado interno para o valor do input (controlado localmente)
    const [inputValue, setInputValue] = useState(value)

    // Efeito que dispara o callback após o tempo de debounce quando inputValue muda
    useEffect(() => {
        // Configura um timer para chamar onChange após o delay
        const timeout = setTimeout(() => {
            onChange(inputValue)
        }, debounce)

        // Cleanup: cancela o timer se o componente desmontar ou se inputValue/debounce mudarem antes do timeout
        return () => clearTimeout(timeout)
    }, [inputValue, debounce, onChange]) // Dependências: executa quando qualquer um muda

    // Renderiza um input controlado com as props repassadas
    return (
        <input 
            {...props} // Repassa todas as props adicionais (ex: placeholder, type)
            className="debounced-input" // Classe para estilização
            value={inputValue} // Valor controlado pelo estado interno
            onChange={(e) => setInputValue(e.target.value)} // Atualiza estado interno a cada tecla
        />
    )
}

export default DebouncedInput