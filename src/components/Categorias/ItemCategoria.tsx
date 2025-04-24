import React from 'react'
import type { Database } from '../../utils/supabase.types'

type Categoria = Database['public']['Tables']['categorias']['Row']

interface ItemCategoriaProps {
  categoria: Categoria
  onDelete: (id: number) => void
  onEdit: (categoria: Categoria) => void
}

const ItemCategoria: React.FC<ItemCategoriaProps> = ({ categoria, onDelete, onEdit }) => {
  return (
    <div
      key={categoria.id}
      className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 hover:shadow-md transition-shadow"
    >
      <div className="flex justify-between items-start">
        <div>
          <h3 className="text-lg font-medium text-gray-800">{categoria.nombre}</h3>
          <div className="mt-2 space-y-1">
            <p className="text-sm text-gray-600">
              Descripción: <span className="font-medium">{categoria.descripcion || 'Sin descripción'}</span>
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => onDelete(categoria.id)}
            className="text-red-500 hover:text-red-700 p-2 rounded-lg hover:bg-red-50 transition-colors"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
          </button>
          <button
            onClick={() => onEdit(categoria)}
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

export default ItemCategoria 