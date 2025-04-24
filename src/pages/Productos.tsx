import { useState, useEffect } from 'react'
import { productosService } from '../services/productos'
import { categoriasService } from '../services/categorias'
import type { Database } from '../utils/supabase.types'
import ProductoModal from '../components/ProductoModal'
import ItemProducto from '../components/Productos/ItemProducti'

type Producto = Database['public']['Tables']['productos']['Row']
type Categoria = Database['public']['Tables']['categorias']['Row']

export default function Productos() {
  const [productos, setProductos] = useState<(Producto & { categoria_nombre?: string })[]>([])
  const [categorias, setCategorias] = useState<Categoria[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [categoriaSeleccionada, setCategoriaSeleccionada] = useState<number | ''>('')
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [selectedProducto, setSelectedProducto] = useState<Producto | undefined>()
  const [loading, setLoading] = useState(true)

  const loadData = async () => {
    try {
      const [productos, categorias] = await Promise.all([
        productosService.getAll(),
        categoriasService.getAll()
      ])
      
      const productosConCategoria = productos.map(producto => ({
        ...producto,
        categoria_nombre: categorias.find(c => c.id === producto.categoria)?.nombre
      }))
      
      setProductos(productosConCategoria)
      setCategorias(categorias)
    } catch (error) {
      console.error('Error al cargar datos:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [])

  const handleEdit = (producto: Producto) => {
    setSelectedProducto(producto)
    setIsModalOpen(true)
  }

  const handleDelete = async (id: number) => {
    if (window.confirm('¿Estás seguro de que deseas eliminar este producto?')) {
      try {
        await productosService.delete(id)
        await loadData()
      } catch (error) {
        console.error('Error al eliminar producto:', error)
      }
    }
  }

  const filteredProductos = productos.filter(producto => {
    const matchesSearch = producto.descripcion.toLowerCase().includes(searchTerm.toLowerCase()) ||
      producto.categoria_nombre?.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesCategoria = categoriaSeleccionada === '' || producto.categoria === categoriaSeleccionada

    return matchesSearch && matchesCategoria
  })

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-semibold text-gray-800">Productos</h1>
        <button
          onClick={() => {
            setSelectedProducto(undefined)
            setIsModalOpen(true)
          }}
          className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
          </svg>
          Registrar Producto
        </button>
      </div>

      {/* Filtros */}
      <div className="mb-6 grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Buscador */}
        <div className="relative">
          <input
            type="text"
            placeholder="Buscar productos..."
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

        {/* Filtro de categorías */}
        <select
          value={categoriaSeleccionada}
          onChange={(e) => setCategoriaSeleccionada(e.target.value ? Number(e.target.value) : '')}
          className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all outline-none appearance-none bg-white"
        >
          <option value="">Todas las categorías</option>
          {categorias.map((categoria) => (
            <option key={categoria.id} value={categoria.id}>
              {categoria.nombre}
            </option>
          ))}
        </select>
      </div>

      {/* Lista de Productos */}
      <div className="grid gap-4">
        {loading ? (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600 mx-auto"></div>
          </div>
        ) : filteredProductos.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            No se encontraron productos
          </div>
        ) : (
          filteredProductos.map((producto) => (
            <ItemProducto
              key={producto.id}
              producto={producto}
              onDelete={handleDelete}
              onEdit={handleEdit}
            />
          ))
        )}
      </div>

      {/* Modal de Crear/Editar Producto */}
      <ProductoModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false)
          setSelectedProducto(undefined)
        }}
        onSuccess={loadData}
        producto={selectedProducto}
        categorias={categorias}
      />
    </div>
  )
} 