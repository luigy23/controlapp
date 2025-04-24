import React, { useState, useEffect } from 'react'
import type { Database } from '../utils/supabase.types'
import { movimientosService } from '../services/movimientos'
import { productosService } from '../services/productos'
import { authService } from '../services/auth'

type Movimiento = Database['public']['Tables']['movimientos']['Row']
type Producto = Database['public']['Tables']['productos']['Row']

interface MovimientoModalProps {
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
  movimiento?: Movimiento
}

const MovimientoModal: React.FC<MovimientoModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  movimiento
}) => {
  const [formData, setFormData] = useState({
    producto_id: '',
    tipo: 'entrada',
    cantidad: '',
    precio_unitario: '',
    descripcion: '',
    usuario: ''
  })
  const [productos, setProductos] = useState<Producto[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [displayPrecio, setDisplayPrecio] = useState('$ 0')
  const [productoSearch, setProductoSearch] = useState('')
  const [showProductoSelect, setShowProductoSelect] = useState(false)

  useEffect(() => {
    const loadProductos = async () => {
      try {
        const data = await productosService.getAll()
        setProductos(data)
      } catch (error) {
        console.error('Error al cargar productos:', error)
      }
    }
    loadProductos()
  }, [])

  useEffect(() => {
    if (movimiento) {
      setFormData({
        producto_id: movimiento.producto_id?.toString() || '',
        tipo: movimiento.tipo || 'entrada',
        cantidad: movimiento.cantidad?.toString() || '',
        precio_unitario: movimiento.precio_unitario?.toString() || '',
        descripcion: movimiento.descripcion || '',
        usuario: movimiento.usuario || ''
      })
      setDisplayPrecio(formatPrice(movimiento.precio_unitario || 0))
    } else {
      const currentUser = authService.getCurrentUser()
      setFormData({
        producto_id: '',
        tipo: 'entrada',
        cantidad: '',
        precio_unitario: '',
        descripcion: '',
        usuario: currentUser?.username || ''
      })
      setDisplayPrecio('$ 0')
    }
    setError(null)
  }, [movimiento])

  const formatPrice = (price: number): string => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(price)
  }

  const handlePriceChange = (value: string) => {
    const numericValue = value.replace(/[^0-9]/g, '')
    const numberValue = parseInt(numericValue) || 0
    
    setFormData(prev => ({ ...prev, precio_unitario: numberValue.toString() }))
    setDisplayPrecio(formatPrice(numberValue))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      const movimientoData = {
        producto_id: formData.producto_id ? parseInt(formData.producto_id) : 0,
        tipo: formData.tipo,
        cantidad: parseInt(formData.cantidad) || 0,
        precio_unitario: parseInt(formData.precio_unitario) || 0,
        descripcion: formData.descripcion || undefined,
        usuario: formData.usuario
      }

      if (movimiento) {
        await movimientosService.update(movimiento.id, movimientoData)
      } else {
        await movimientosService.create(movimientoData)
      }

      onSuccess()
      onClose()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al guardar el movimiento')
    } finally {
      setLoading(false)
    }
  }

  const calcularTotal = () => {
    const cantidad = parseInt(formData.cantidad) || 0
    const precio = parseInt(formData.precio_unitario) || 0
    return cantidad * precio
  }

  const getTipoColor = (tipo: string) => {
    switch (tipo) {
      case 'entrada':
        return 'bg-emerald-100 text-emerald-800 border-emerald-200'
      case 'salida':
        return 'bg-red-100 text-red-800 border-red-200'
      case 'ajuste':
        return 'bg-blue-100 text-blue-800 border-blue-200'
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  if (!isOpen) return null

  const handleOverlayClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) {
      onClose()
    }
  }

  const filteredProductos = productos.filter(producto =>
    producto.descripcion.toLowerCase().includes(productoSearch.toLowerCase())
  )

  const selectedProducto = productos.find(p => p.id.toString() === formData.producto_id)

  const handleProductoSelect = (producto: Producto) => {
    setFormData({ 
      ...formData, 
      producto_id: producto.id.toString(),
      precio_unitario: producto.precio.toString()
    })
    setDisplayPrecio(formatPrice(producto.precio))
    setShowProductoSelect(false)
    setProductoSearch('')
  }

  return (
    <div 
      className="fixed inset-0 bg-black/55 bg-opacity-50 flex items-start justify-center pt-4 sm:pt-6 md:pt-16 px-4 pb-4 z-50 overflow-y-auto min-h-screen"
      onClick={handleOverlayClick}
    >
      <div className="bg-white rounded-xl w-full max-w-3xl shadow-xl transform transition-all my-auto">
        <div className="flex justify-between items-center p-4 border-b">
          <h2 className="text-xl font-semibold text-gray-800">
            {movimiento ? 'Editar Movimiento' : 'Nuevo Movimiento'}
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

        <form onSubmit={handleSubmit} className="p-4 sm:p-6">
          {error && (
            <div className="mb-4 p-3 bg-red-50 text-red-700 rounded-lg">
              {error}
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
            {/* Primera columna */}
            <div className="space-y-4">
              <div className="relative">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Producto
                </label>
                {movimiento ? (
                  <div className="w-full appearance-none rounded-lg bg-gray-50 px-4 py-2.5 text-gray-700 shadow-sm border border-gray-200">
                    {selectedProducto?.descripcion} - Stock: {selectedProducto?.stock}
                  </div>
                ) : (
                  <div className="relative">
                    <div
                      onClick={() => setShowProductoSelect(!showProductoSelect)}
                      className="w-full appearance-none rounded-lg bg-white px-4 py-2.5 text-gray-700 shadow-sm border border-gray-200 focus:border-gray-400 focus:outline-none cursor-pointer flex justify-between items-center"
                    >
                      <span className="truncate">
                        {selectedProducto 
                          ? `${selectedProducto.descripcion} - Stock: ${selectedProducto.stock}`
                          : 'Seleccionar producto'
                        }
                      </span>
                      <svg 
                        className={`h-5 w-5 text-gray-400 transition-transform flex-shrink-0 ${showProductoSelect ? 'rotate-180' : ''}`}
                        xmlns="http://www.w3.org/2000/svg" 
                        viewBox="0 0 20 20" 
                        fill="currentColor"
                      >
                        <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                      </svg>
                    </div>

                    {showProductoSelect && (
                      <div className="absolute z-10 w-full mt-1 bg-white rounded-lg shadow-lg border border-gray-200 max-h-60 overflow-y-auto">
                        <div className="p-2 sticky top-0 bg-white border-b border-gray-200">
                          <input
                            type="text"
                            value={productoSearch}
                            onChange={(e) => setProductoSearch(e.target.value)}
                            placeholder="Buscar producto..."
                            className="w-full px-3 py-2 text-sm border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500"
                            onClick={(e) => e.stopPropagation()}
                          />
                        </div>
                        <div className="py-1">
                          {filteredProductos.length === 0 ? (
                            <div className="px-4 py-2 text-sm text-gray-500">
                              No se encontraron productos
                            </div>
                          ) : (
                            filteredProductos.map((producto) => (
                              <div
                                key={producto.id}
                                onClick={() => handleProductoSelect(producto)}
                                className="px-4 py-2 text-sm text-gray-700 hover:bg-emerald-50 cursor-pointer flex justify-between items-center"
                              >
                                <span className="truncate">{producto.descripcion}</span>
                                <span className="text-emerald-600 font-medium flex-shrink-0 ml-2">
                                  Stock: {producto.stock}
                                </span>
                              </div>
                            ))
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                )}
                {movimiento && (
                  <p className="mt-1 text-sm text-gray-500">
                    No se puede cambiar el producto en un movimiento existente para mantener la integridad del inventario.
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Tipo de Movimiento
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {['entrada', 'salida'].map((tipo) => (
                    <button
                      key={tipo}
                      type="button"
                      onClick={() => setFormData({ ...formData, tipo })}
                      className={`px-3 sm:px-4 py-2 sm:py-2.5 rounded-lg border-2 text-sm font-medium transition-colors ${
                        formData.tipo === tipo
                          ? getTipoColor(tipo)
                          : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'
                      }`}
                    >
                      {tipo.charAt(0).toUpperCase() + tipo.slice(1)}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Cantidad
                </label>
                <input
                  type="number"
                  value={formData.cantidad}
                  onChange={(e) => setFormData({ ...formData, cantidad: e.target.value })}
                  className="w-full appearance-none rounded-lg bg-white px-4 py-2.5 text-gray-700 shadow-sm border border-gray-200 focus:border-gray-400 focus:outline-none"
                  placeholder="0"
                  min="0"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Descripción
                </label>
                <textarea
                  value={formData.descripcion}
                  onChange={(e) => setFormData({ ...formData, descripcion: e.target.value })}
                  className="w-full appearance-none rounded-lg bg-white px-4 py-2.5 text-gray-700 shadow-sm border border-gray-200 focus:border-gray-400 focus:outline-none"
                  rows={3}
                  placeholder="Descripción detallada del movimiento"
                />
              </div>
            </div>

            {/* Segunda columna */}
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Precio Unitario
                </label>
                <input
                  type="text"
                  value={displayPrecio}
                  onChange={(e) => handlePriceChange(e.target.value)}
                  className="w-full appearance-none rounded-lg bg-white px-4 py-2.5 text-gray-700 shadow-sm border border-gray-200 focus:border-gray-400 focus:outline-none"
                  placeholder="$ 0"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Total
                </label>
                <div className="w-full appearance-none rounded-lg bg-gray-50 px-4 py-2.5 text-gray-700 shadow-sm border border-gray-200">
                  {formatPrice(calcularTotal())}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Usuario
                </label>
                <input
                  type="text"
                  value={formData.usuario}
                  onChange={(e) => setFormData({ ...formData, usuario: e.target.value })}
                  className="w-full appearance-none rounded-lg bg-white px-4 py-2.5 text-gray-700 shadow-sm border border-gray-200 focus:border-gray-400 focus:outline-none"
                  placeholder="Nombre del usuario"
                  required
                />
              </div>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row justify-end gap-2 mt-6">
            <button
              type="button"
              onClick={onClose}
              className="w-full sm:w-auto px-4 py-2 text-red-700 bg-red-100 hover:bg-red-200 rounded-lg transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loading}
              className="w-full sm:w-auto px-4 py-2 text-emerald-700 bg-emerald-100 hover:bg-emerald-200 rounded-lg transition-colors"
            >
              {loading ? 'Guardando...' : movimiento ? 'Guardar Cambios' : 'Crear Movimiento'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default MovimientoModal 