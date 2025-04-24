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
  const [displayCosto, setDisplayCosto] = useState('$ 0')
  const [displayPrecio, setDisplayPrecio] = useState('$ 0')
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
      setDisplayCosto('$ 0')
      setDisplayPrecio('$ 0')
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
        categoria: formData.categoria
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
      className="fixed inset-0 bg-black/55 bg-opacity-50 flex items-center justify-center p-4 z-50"
      onClick={handleOverlayClick}
    >
      <div className="bg-white rounded-lg w-full max-w-4xl">
        <div className="flex justify-between items-center p-4 border-b">
          <h2 className="text-xl font-semibold text-gray-800">
            {producto ? 'Editar Producto' : 'Nuevo Producto'}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6">
          {error && (
            <div className="mb-4 p-3 bg-red-50 text-red-700 rounded-lg">
              {error}
            </div>
          )}

          <div className="grid grid-cols-2 gap-6">
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
                  className="w-full appearance-none rounded-lg bg-white px-4 py-2.5 text-gray-700 shadow-sm border border-gray-200 focus:border-gray-400 focus:outline-none"
                  placeholder="Descripción del producto"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Categoría
                </label>
                <select
                  value={formData.categoria ?? ''}
                  onChange={(e) => {
                    const value = e.target.value
                    setFormData({ ...formData, categoria: value ? Number(value) : null })
                  }}
                  className="w-full appearance-none rounded-lg bg-white px-4 py-2.5 text-gray-700 shadow-sm border border-gray-200 focus:border-gray-400 focus:outline-none"
                >
                  <option value="">Seleccionar categoría</option>
                  {categorias.map((cat) => (
                    <option key={cat.id} value={cat.id}>
                      {cat.nombre}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Stock
                </label>
                <input
                  type="number"
                  value={formData.stock || ''}
                  onChange={(e) => setFormData({ ...formData, stock: Number(e.target.value) || null })}
                  className="w-full appearance-none rounded-lg bg-white px-4 py-2.5 text-gray-700 shadow-sm border border-gray-200 focus:border-gray-400 focus:outline-none"
                  placeholder="0"
                  min="0"
                />
              </div>
            </div>

            {/* Segunda columna */}
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Costo
                </label>
                <input
                  type="text"
                  value={displayCosto}
                  onChange={(e) => handlePriceChange('costo', e.target.value)}
                  className="w-full appearance-none rounded-lg bg-white px-4 py-2.5 text-gray-700 shadow-sm border border-gray-200 focus:border-gray-400 focus:outline-none"
                  placeholder="$ 0"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Precio de Venta
                </label>
                <input
                  type="text"
                  value={displayPrecio}
                  onChange={(e) => handlePriceChange('precio', e.target.value)}
                  className="w-full appearance-none rounded-lg bg-white px-4 py-2.5 text-gray-700 shadow-sm border border-gray-200 focus:border-gray-400 focus:outline-none"
                  placeholder="$ 0"
                />
              </div>

              {formData.costo && formData.precio && (
                <div className="bg-emerald-50 p-3 rounded-lg">
                  <p className="text-sm text-emerald-800">
                    Margen de ganancia: {' '}
                    <span className="font-medium">
                      {formData.costo > 0 
                        ? `${Math.round(((formData.precio - formData.costo) / formData.costo) * 100)}%`
                        : '0%'
                      }
                    </span>
                  </p>
                </div>
              )}
            </div>
          </div>

          <div className="flex justify-end gap-2 mt-6">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-red-700 bg-red-100 hover:bg-red-200 rounded-lg transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-emerald-700 bg-emerald-100 hover:bg-emerald-200 rounded-lg transition-colors"
            >
              {producto ? 'Guardar Cambios' : 'Crear Producto'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
} 