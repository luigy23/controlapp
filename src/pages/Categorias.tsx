import { useState, useEffect } from 'react'
import type { Database } from '../utils/supabase.types'
import CategoriaModal from '../components/CategoriaModal'
import ItemCategoria from '../components/Categorias/ItemCategoria'
import { categoriasService } from '../services/categorias'

type Categoria = Database['public']['Tables']['categorias']['Row']

export default function Categorias() {
  const [categorias, setCategorias] = useState<Categoria[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [selectedCategoria, setSelectedCategoria] = useState<Categoria | undefined>()
  const [loading, setLoading] = useState(true)

  const loadData = async () => {
    try {
      const data = await categoriasService.getAll()
      setCategorias(data)
    } catch (error) {
      console.error('Error al cargar categorías:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [])

  const handleEdit = (categoria: Categoria) => {
    setSelectedCategoria(categoria)
    setIsModalOpen(true)
  }

  const handleDelete = async (id: number) => {
    if (window.confirm('¿Estás seguro de que deseas eliminar esta categoría?')) {
      try {
        await categoriasService.delete(id)
        await loadData()
      } catch (error) {
        console.error('Error al eliminar categoría:', error)
      }
    }
  }

  const filteredCategorias = categorias.filter(categoria =>
    categoria.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (categoria.descripcion?.toLowerCase().includes(searchTerm.toLowerCase()) || false)
  )

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-semibold text-gray-800">Categorías</h1>
        <button
          onClick={() => {
            setSelectedCategoria(undefined)
            setIsModalOpen(true)
          }}
          className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
          </svg>
          Nueva Categoría
        </button>
      </div>

      {/* Buscador */}
      <div className="mb-6">
        <div className="relative">
          <input
            type="text"
            placeholder="Buscar categorías..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all outline-none"
          />
          <svg
            className="absolute right-3 top-3.5 h-5 w-5 text-gray-400"
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 20 20"
            fill="currentColor"
          >
            <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
          </svg>
        </div>
      </div>

      {/* Lista de Categorías */}
      <div className="grid gap-4">
        {loading ? (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600 mx-auto"></div>
          </div>
        ) : filteredCategorias.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            No se encontraron categorías
          </div>
        ) : (
          filteredCategorias.map((categoria) => (
            <ItemCategoria
              key={categoria.id}
              categoria={categoria}
              onDelete={handleDelete}
              onEdit={handleEdit}
            />
          ))
        )}
      </div>

      {/* Modal de Crear/Editar Categoría */}
      <CategoriaModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false)
          setSelectedCategoria(undefined)
        }}
        onSuccess={loadData}
        categoria={selectedCategoria}
      />
    </div>
  )
} 