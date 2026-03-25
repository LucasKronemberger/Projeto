import { useEffect, useState } from 'react'
import { supabase } from './supabaseClient'
import CarCard from './components/CarCard'

function App() {
  const [cars, setCars] = useState([])
  const [search, setSearch] = useState('')
  const [showFavorites, setShowFavorites] = useState(false)

  const getCars = async () => {
    const { data, error } = await supabase.from('cars').select('*').order('created_at', { ascending: false })
    if (error) console.error('Erro:', error)
    else setCars(data || [])
  }

  useEffect(() => { getCars() }, [])

  // Lógica de Filtro Combinada (Pesquisa + Favoritos)
  const filteredCars = cars.filter(car => {
    const matchesSearch = car.model.toLowerCase().includes(search.toLowerCase())
    const matchesFavorite = showFavorites ? car.favorite : true
    return matchesSearch && matchesFavorite
  })

  return (
    <div>
      <h1>🚗 Lasanha Tracker</h1>

      <div className="controls">
        <input 
          type="text" 
          placeholder="Pesquisar modelo (Ex: Santana)..." 
          className="search-bar"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        
        <button 
          className={`btn-filter ${showFavorites ? 'active' : ''}`}
          onClick={() => setShowFavorites(!showFavorites)}
        >
          {showFavorites ? '📂 Ver Todos' : '⭐ Ver Favoritos'}
        </button>
      </div>

      <div className="container">
        {filteredCars.length > 0 ? (
          filteredCars.map(car => (
            <CarCard key={car.id} car={car} onUpdate={getCars} />
          ))
        ) : (
          <p>{showFavorites ? "Nenhum favorito salvo ainda." : "Buscando oportunidades..."}</p>
        )}
      </div>
    </div>
  )
}

export default App