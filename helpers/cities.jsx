// helpers/cities.jsx

// Define a URL base da API do IBGE
const baseUrl = 'https://servicodados.ibge.gov.br/api/v1'

// Função auxiliar para converter resposta HTTP em JSON
const responseToJSON = (response) => response.json()

// Função para ordenação alfabética crescente baseada no campo 'label'
const sortByLabelAscending = (a, b) => {
    return a.label.localeCompare(b.label)
}

// Função principal para processar e transformar dados de cidades da API do IBGE
export const parseCities = (cities) => {
  const data = cities
    // Mapeia cada objeto cidade para um formato padronizado com os campos necessários
    .map(city => ({
      label: city.nome,                    // Nome da cidade para exibição
      value: city.id,                      // ID único para chave React
      // Converte coordenadas para números flutuantes, tratando vírgulas e valores ausentes
      lat: city.latitude ? parseFloat(String(city.latitude).replace(',', '.')) : null,
      lon: city.longitude ? parseFloat(String(city.longitude).replace(',', '.')) : null,
      state: city?.microrregiao?.mesorregiao?.UF?.nome || null,      // Nome completo do estado
      stateSigla: city?.microrregiao?.mesorregiao?.UF?.sigla || null // Sigla do estado (ex: SP)
    }))
    // Filtra apenas itens com label e value válidos (permite lat/lon ausentes)
    .filter(city => city.label && city.value)
    // Ordena alfabeticamente pelo nome da cidade
    .sort(sortByLabelAscending);

  return data;
};

// Função para buscar a lista de municípios da API do IBGE
export const fetchCities = () => {
  const url = `${baseUrl}/localidades/municipios`; // Endpoint de municípios
  // Faz a requisição com cache forçado para melhor performance em visitas repetidas
  return fetch(url, {cache: 'force-cache'}).then(responseToJSON);
};