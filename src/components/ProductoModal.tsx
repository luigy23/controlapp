import { useState, useEffect } from 'react'
import type { Database } from '../utils/supabase.types'
import { productosService } from '../services/productos'

type ProductoBase = Database['public']['Tables']['productos']['Insert']
type Producto = Omit<ProductoBase, 'stock' | 'costo' | 'precio' | 'categoria'> & {
  stock?: number | null
  costo?: number | null
  precio?: number | null
  categoria?: number | null
}
type Categoria = Database['public']['Tables']['categorias']['Row']

interface ProductoModalProps {
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
  producto?: Database['public']['Tables']['productos']['Row']
  categorias: Categoria[]
}

export default function ProductoModal({
  isOpen,
  onClose,
  onSuccess,
  producto,
  categorias
}: ProductoModalProps) {
  const [formData, setFormData] = useState<Producto>({
    descripcion: '',
    stock: null,
    costo: null,
    precio: null,
    categoria: null
  })
  const [displayCosto, setDisplayCosto] = useState(' 0')
  const [displayPrecio, setDisplayPrecio] = useState(' 0')
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (producto) {
      setFormData(producto)
      setDisplayCosto(formatPrice(producto.costo || 0))
      setDisplayPrecio(formatPrice(producto.precio || 0))
    } else {
      setFormData({
        descripcion: '',
        stock: null,
        costo: null,
        precio: null,
        categoria: null
      })
      setDisplayCosto(' 0')
      setDisplayPrecio(' 0')
    }
    setError(null)
  }, [producto])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    try {
      const productoToSave: ProductoBase = {
        descripcion: formData.descripcion,
        stock: formData.stock || 0,
        costo: formData.costo || 0,
        precio: formData.precio || 0,
        categoria: formData.categoria || 0
      }

      if (producto) {
        await productosService.update(producto.id, productoToSave)
      } else {
        await productosService.create(productoToSave)
      }
      
      onSuccess()
      onClose()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al guardar el producto')
    }
  }

  const formatPrice = (price: number): string => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(price)
  }

  const handlePriceChange = (field: 'costo' | 'precio', value: string) => {
    const numericValue = value.replace(/[^0-9]/g, '')
    const numberValue = parseInt(numericValue) || null
    
    setFormData(prev => ({ ...prev, [field]: numberValue }))
    if (field === 'costo') {
      setDisplayCosto(formatPrice(numberValue || 0))
    } else {
      setDisplayPrecio(formatPrice(numberValue || 0))
    }
  }

  if (!isOpen) return null

  const handleOverlayClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) {
      onClose()
    }
  }

  return (
    <div 
      className="fixed inset-0 bg-black/55 bg-opacity-50 flex items-start justify-center pt-4 sm:pt-6 md:pt-16 px-4 pb-4 z-50 overflow-y-auto min-h-screen"
      onClick={handleOverlayClick}
    >
      <div className="bg-white rounded-xl w-full max-w-3xl shadow-xl transform transition-all my-auto">
        {/* Header */}
        <div className="flex justify-between items-center p-4 sm:p-6 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-emerald-100 rounded-lg">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
              </svg>
            </div>
            <h2 className="text-xl font-bold text-gray-900">
              {producto ? 'Editar Producto' : 'Nuevo Producto'}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100 transition-colors"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-4 sm:p-6">
          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center space-x-2">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-red-500" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
              <p className="text-sm text-red-700">{error}</p>
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Primera columna */}
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Descripción
                </label>
                <input
                  type="text"
                  value={formData.descripcion || ''}
                  onChange={(e) => setFormData({ ...formData, descripcion: e.target.value })}
                  className="w-full appearance-none rounded-lg bg-white px-4 py-3 text-gray-700 shadow-sm border border-gray-200 placeholder-gray-400 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 focus:outline-none transition-all"
                  placeholder="Ingresa la descripción del producto"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Categoría
                </label>
                <div className="relative">
                  <select
                    value={formData.categoria ?? ''}
                    onChange={(e) => {
                      const value = e.target.value
                      setFormData({ ...formData, categoria: value ? Number(value) : null })
                    }}
                    className="w-full appearance-none rounded-lg bg-white pl-4 pr-10 py-3 text-gray-700 shadow-sm border border-gray-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 focus:outline-none transition-all"
                  >
                    <option value="">Seleccionar categoría</option>
                    {categorias.map((cat) => (
                      <option key={cat.id} value={cat.id}>
                        {cat.nombre}
                      </option>
                    ))}
                  </select>
                  <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-400">
                    <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                    </svg>
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Stock
                </label>
                <div className="relative">
                  <input
                    type="number"
                    value={formData.stock || ''}
                    onChange={(e) => setFormData({ ...formData, stock: Number(e.target.value) || null })}
                    className="w-full appearance-none rounded-lg bg-white pl-10 pr-4 py-3 text-gray-700 shadow-sm border border-gray-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 focus:outline-none transition-all"
                    placeholder="0"
                    min="0"
                  />
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                    </svg>
                  </div>
                </div>
              </div>
            </div>

            {/* Segunda columna */}
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Costo
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={displayCosto}
                    onChange={(e) => handlePriceChange('costo', e.target.value)}
                    className="w-full appearance-none rounded-lg bg-white pl-10 pr-4 py-3 text-gray-700 shadow-sm border border-gray-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 focus:outline-none transition-all"
                    placeholder=" 0"
                  />
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <span className="text-gray-400">$</span>
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Precio de Venta
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={displayPrecio}
                    onChange={(e) => handlePriceChange('precio', e.target.value)}
                    className="w-full appearance-none rounded-lg bg-white pl-10 pr-4 py-3 text-gray-700 shadow-sm border border-gray-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 focus:outline-none transition-all"
                    placeholder=" 0"
                  />
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <span className="text-gray-400">$</span>
                  </div>
                </div>
              </div>

              {formData.costo && formData.precio && (
                <div className="bg-emerald-50 p-4 rounded-lg border border-emerald-100">
                  <div className="flex items-center space-x-3">
                    <div className="p-2 bg-emerald-100 rounded-lg">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                      </svg>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-emerald-800">
                        Margen de ganancia
                      </p>
                      <p className="text-2xl font-bold text-emerald-700">
                        {formData.costo > 0 
                          ? `${Math.round(((formData.precio - formData.costo) / formData.costo) * 100)}%`
                          : '0%'
                        }
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="flex flex-col sm:flex-row justify-end gap-3 mt-8">
            <button
              type="button"
              onClick={onClose}
              className="w-full sm:w-auto px-6 py-3 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-200 transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="w-full sm:w-auto px-6 py-3 text-sm font-medium text-white bg-emerald-600 rounded-lg hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500 transition-colors"
            >
              {producto ? 'Guardar Cambios' : 'Crear Producto'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
} 