{/* <div
key={producto.id}
className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 hover:shadow-md transition-shadow"
>
<div className="flex justify-between items-start">
  <div>
    <h3 className="text-lg font-medium text-gray-800">{producto.descripcion}</h3>
    <div className="mt-2 space-y-1">
      <p className="text-sm text-gray-600">
        Stock: <span className="font-medium">{producto.stock}</span>
      </p>
      <p className="text-sm text-gray-600">
        Precio: <span className="font-medium">${producto.precio}</span>
      </p>
      {producto.categoria_nombre && (
        <span className="inline-block bg-emerald-100 text-emerald-800 text-xs px-2 py-1 rounded-full">
          {producto.categoria_nombre}
        </span>
      )}
    </div>
  </div>
  <div className="flex gap-2">
    <button
      onClick={() => handleDelete(producto.id)}
      className="text-red-500 hover:text-red-700 p-2 rounded-lg hover:bg-red-50 transition-colors"
    >
      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
        <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
      </svg>
    </button>
    <button
      onClick={() => handleEdit(producto)}
      className="text-blue-500 hover:text-blue-700 p-2 rounded-lg hover:bg-blue-50 transition-colors"
    >
      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
        <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
      </svg>
    </button>
  </div>
</div>
</div> */}

import React from 'react'
import type { Database } from '../../utils/supabase.types'

type Producto = Database['public']['Tables']['productos']['Row']

interface ItemProductoProps {
  producto: Producto & { categoria_nombre?: string }
  onDelete: (id: number) => void
  onEdit: (producto: Producto) => void
}

const ItemProducto: React.FC<ItemProductoProps> = ({ producto, onDelete, onEdit }) => {
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(price)
  }

  const getStockColor = (stock: number) => {
    if (stock <= 5) return 'text-red-600 bg-red-50'
    if (stock <= 10) return 'text-yellow-600 bg-yellow-50'
    return 'text-emerald-600 bg-emerald-50'
  }

  return (
    <div className="bg-white rounded-xl shadow-sm hover:shadow-md transition-all duration-200 overflow-hidden">
      <div className="p-5">
        {/* Encabezado con acciones */}
        <div className="flex justify-between items-start mb-3">
          <h3 className="text-lg font-semibold text-gray-800 line-clamp-2">
            {producto.descripcion}
          </h3>
          <div className="flex gap-1 -mt-1 -mr-1">
            <button
              onClick={() => onEdit(producto)}
              className="p-2 text-gray-400 hover:text-blue-500 hover:bg-blue-50 rounded-lg transition-colors"
              title="Editar"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
              </svg>
            </button>
            <button
              onClick={() => onDelete(producto.id)}
              className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
              title="Eliminar"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
            </button>
          </div>
        </div>

        {/* Información principal */}
        <div className="grid grid-cols-2 gap-4 mb-3">
          <div>
            <p className="text-sm text-gray-500 mb-1">Stock</p>
            <div className={`inline-flex items-center px-2.5 py-1 rounded-lg text-sm font-medium ${getStockColor(producto.stock)}`}>
              {producto.stock} unidades
            </div>
          </div>
          <div>
            <p className="text-sm text-gray-500 mb-1">Precio</p>
            <div className="text-lg font-semibold text-gray-800">
              {formatPrice(producto.precio)}
            </div>
          </div>
        </div>

        {/* Categoría */}
        {producto.categoria_nombre && (
          <div className="mt-4 flex items-center gap-2">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-gray-400" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M17.707 9.293a1 1 0 010 1.414l-7 7a1 1 0 01-1.414 0l-7-7A.997.997 0 012 10V5a3 3 0 013-3h5c.256 0 .512.098.707.293l7 7zM5 6a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" />
            </svg>
            <span className="text-sm text-gray-600">
              {producto.categoria_nombre}
            </span>
          </div>
        )}
      </div>
    </div>
  )
}

export default ItemProducto
