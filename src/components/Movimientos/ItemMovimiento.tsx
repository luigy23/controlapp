import React from 'react'
import type { Database } from '../../utils/supabase.types'

type Movimiento = Database['public']['Tables']['movimientos']['Row'] & {
  producto: {
    id: number
    descripcion: string
    stock: number
    precio: number
  }
}

interface ItemMovimientoProps {
  movimiento: Movimiento
  onDelete: (id: number) => void
  onEdit: (movimiento: Movimiento) => void
}

const ItemMovimiento: React.FC<ItemMovimientoProps> = ({ movimiento, onDelete, onEdit }) => {
  const getTipoColor = (tipo: string) => {
    switch (tipo) {
      case 'entrada':
        return 'bg-emerald-100 text-emerald-800'
      case 'salida':
        return 'bg-red-100 text-red-800'
      case 'ajuste':
        return 'bg-blue-100 text-blue-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const formatDate = (date: string) => {
    return new Date(date).toLocaleString('es-ES', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(price)
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 hover:shadow-md transition-shadow">
      <div className="flex justify-between items-start">
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <h3 className="text-lg font-medium text-gray-800">{movimiento.producto.descripcion}</h3>
            <span className={`inline-block ${getTipoColor(movimiento.tipo)} text-xs px-2 py-1 rounded-full`}>
              {movimiento.tipo.toUpperCase()}
            </span>
          </div>
          
          <div className="mt-2 space-y-1">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-600">
                  Cantidad: <span className="font-medium">{movimiento.cantidad}</span>
                </p>
                <p className="text-sm text-gray-600">
                  Precio Unitario: <span className="font-medium">{formatPrice(movimiento.precio_unitario)}</span>
                </p>
                <p className="text-sm text-gray-600">
                  Total: <span className="font-medium">{formatPrice(movimiento.total)}</span>
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600">
                  Usuario: <span className="font-medium">{movimiento.usuario}</span>
                </p>
                <p className="text-sm text-gray-600">
                  Fecha: <span className="font-medium">{formatDate(movimiento.created_at)}</span>
                </p>
                {movimiento.referencia && (
                  <p className="text-sm text-gray-600">
                    Referencia: <span className="font-medium">{movimiento.referencia}</span>
                  </p>
                )}
              </div>
            </div>
            
            {movimiento.descripcion && (
              <p className="text-sm text-gray-600 mt-2">
                Descripción: <span className="font-medium">{movimiento.descripcion}</span>
              </p>
            )}
          </div>
        </div>

        <div className="flex gap-2">
          <button
            onClick={() => onDelete(movimiento.id)}
            className="text-red-500 hover:text-red-700 p-2 rounded-lg hover:bg-red-50 transition-colors"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
          </button>
          <button
            onClick={() => onEdit(movimiento)}
            className="text-blue-500 hover:text-blue-700 p-2 rounded-lg hover:bg-blue-50 transition-colors"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  )
}

export default ItemMovimiento 