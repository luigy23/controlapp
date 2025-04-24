import { useState, useEffect } from 'react'
import { productosService } from '../services/productos'
import { categoriasService } from '../services/categorias'
import type { Database } from '../utils/supabase.types'
import ProductoModal from '../components/ProductoModal'
import ItemProducto from '../components/Productos/ItemProducti'

type Producto = Database['public']['Tables']['productos']['Row']
type Categoria = Database['public']['Tables']['categorias']['Row']

type SortOrder = 'asc' | 'desc' | ''

export default function Productos() {
  const [productos, setProductos] = useState<(Producto & { categoria_nombre?: string })[]>([])
  const [categorias, setCategorias] = useState<Categoria[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [categoriaSeleccionada, setCategoriaSeleccionada] = useState<number | ''>('')
  const [sortOrder, setSortOrder] = useState<SortOrder>('')
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

  const filteredProductos = productos
    .filter(producto => {
      const matchesSearch = producto.descripcion.toLowerCase().includes(searchTerm.toLowerCase()) ||
        producto.categoria_nombre?.toLowerCase().includes(searchTerm.toLowerCase())
      
      const matchesCategoria = categoriaSeleccionada === '' || producto.categoria === categoriaSeleccionada

      return matchesSearch && matchesCategoria
    })
    .sort((a, b) => {
      if (sortOrder === 'asc') {
        return a.stock - b.stock
      } else if (sortOrder === 'desc') {
        return b.stock - a.stock
      }
      return 0
    })

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header con estadísticas */}
        <div className="mb-8">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6">
            <h1 className="text-2xl font-bold text-gray-900 mb-4 sm:mb-0">Productos</h1>
            <button
              onClick={() => {
                setSelectedProducto(undefined)
                setIsModalOpen(true)
              }}
              className="w-full sm:w-auto bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2.5 rounded-lg flex items-center justify-center gap-2 transition-colors"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
              </svg>
              Registrar Producto
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
              <div className="flex items-center">
                <div className="p-2 bg-emerald-100 rounded-lg">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                  </svg>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-500">Total Productos</p>
                  <p className="text-2xl font-semibold text-gray-900">{productos.length}</p>
                </div>
              </div>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
              <div className="flex items-center">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z" />
                  </svg>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-500">Stock Total</p>
                  <p className="text-2xl font-semibold text-gray-900">
                    {productos.reduce((acc, curr) => acc + curr.stock, 0)}
                  </p>
                </div>
              </div>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
              <div className="flex items-center">
                <div className="p-2 bg-yellow-100 rounded-lg">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-yellow-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-500">Stock Bajo</p>
                  <p className="text-2xl font-semibold text-gray-900">
                    {productos.filter(p => p.stock <= 5).length}
                  </p>
                </div>
              </div>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
              <div className="flex items-center">
                <div className="p-2 bg-purple-100 rounded-lg">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                  </svg>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-500">Categorías</p>
                  <p className="text-2xl font-semibold text-gray-900">{categorias.length}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Filtros */}
        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200 mb-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {/* Buscador */}
            <div className="relative">
              <input
                type="text"
                placeholder="Buscar productos..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all outline-none"
              />
              <svg
                className="absolute left-3 top-3 h-5 w-5 text-gray-400"
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
              className="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all outline-none appearance-none bg-white"
            >
              <option value="">Todas las categorías</option>
              {categorias.map((categoria) => (
                <option key={categoria.id} value={categoria.id}>
                  {categoria.nombre}
                </option>
              ))}
            </select>

            {/* Filtro de orden por stock */}
            <select
              value={sortOrder}
              onChange={(e) => setSortOrder(e.target.value as SortOrder)}
              className="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all outline-none appearance-none bg-white"
            >
              <option value="">Ordenar por stock</option>
              <option value="asc">Menor a mayor stock</option>
              <option value="desc">Mayor a menor stock</option>
            </select>
          </div>
        </div>

        {/* Lista de Productos */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {loading ? (
            <div className="col-span-full flex justify-center items-center py-12">
              <div className="flex items-center space-x-3">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600"></div>
                <span className="text-gray-500">Cargando productos...</span>
              </div>
            </div>
          ) : filteredProductos.length === 0 ? (
            <div className="col-span-full bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
              </svg>
              <h3 className="mt-4 text-lg font-medium text-gray-900">No se encontraron productos</h3>
              <p className="mt-2 text-sm text-gray-500">
                Intenta ajustar los filtros o crea un nuevo producto.
              </p>
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