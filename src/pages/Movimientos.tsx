import { useState, useEffect } from 'react'
import type { Database } from '../utils/supabase.types'
import { movimientosService } from '../services/movimientos'
import MovimientoModal from '../components/MovimientoModal'
import ItemMovimiento from '../components/Movimientos/ItemMovimiento'

type Movimiento = Database['public']['Tables']['movimientos']['Row'] & {
  producto: {
    id: number
    descripcion: string
    stock: number
    precio: number
  }
}

export default function Movimientos() {
  const [movimientos, setMovimientos] = useState<Movimiento[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [tipoSeleccionado, setTipoSeleccionado] = useState<string>('')
  const [fechaInicio, setFechaInicio] = useState('')
  const [fechaFin, setFechaFin] = useState('')
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [selectedMovimiento, setSelectedMovimiento] = useState<Movimiento | undefined>()
  const [loading, setLoading] = useState(true)

  const loadData = async () => {
    try {
      const data = await movimientosService.getAll()
      setMovimientos(data)
    } catch (error) {
      console.error('Error al cargar movimientos:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [])

  const handleEdit = (movimiento: Movimiento) => {
    setSelectedMovimiento(movimiento)
    setIsModalOpen(true)
  }

  const handleDelete = async (id: number) => {
    if (window.confirm('¿Estás seguro de que deseas eliminar este movimiento?')) {
      try {
        await movimientosService.delete(id)
        await loadData()
      } catch (error) {
        console.error('Error al eliminar movimiento:', error)
      }
    }
  }

  const limpiarFiltros = () => {
    setSearchTerm('')
    setTipoSeleccionado('')
    setFechaInicio('')
    setFechaFin('')
  }

  const filteredMovimientos = movimientos.filter(movimiento => {
    const matchesSearch = 
      movimiento.producto.descripcion.toLowerCase().includes(searchTerm.toLowerCase()) ||
      movimiento.usuario.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesTipo = tipoSeleccionado === '' || movimiento.tipo === tipoSeleccionado

    const fechaMovimiento = new Date(movimiento.created_at)
    const matchesFechaInicio = !fechaInicio || fechaMovimiento >= new Date(fechaInicio)
    const matchesFechaFin = !fechaFin || fechaMovimiento <= new Date(fechaFin + 'T23:59:59')

    return matchesSearch && matchesTipo && matchesFechaInicio && matchesFechaFin
  })

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-semibold text-gray-800">Movimientos</h1>
        <button
          onClick={() => {
            setSelectedMovimiento(undefined)
            setIsModalOpen(true)
          }}
          className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
          </svg>
          Nuevo Movimiento
        </button>
      </div>

      {/* Filtros */}
      <div className="mb-6 space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Buscador */}
          <div className="relative">
            <input
              type="text"
              placeholder="Buscar movimientos..."
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

          {/* Filtro de tipo */}
          <select
            value={tipoSeleccionado}
            onChange={(e) => setTipoSeleccionado(e.target.value)}
            className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all outline-none appearance-none bg-white"
          >
            <option value="">Todos los tipos</option>
            <option value="entrada">Entradas</option>
            <option value="salida">Salidas</option>
            <option value="ajuste">Ajustes</option>
          </select>

          {/* Filtro de fecha inicio */}
          <div className="relative">
            <input
              type="date"
              value={fechaInicio}
              onChange={(e) => setFechaInicio(e.target.value)}
              className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all outline-none"
            />
            <label className="absolute -top-2 left-2 px-1 text-xs text-gray-500 bg-white">
              Fecha Inicio
            </label>
          </div>

          {/* Filtro de fecha fin */}
          <div className="relative">
            <input
              type="date"
              value={fechaFin}
              onChange={(e) => setFechaFin(e.target.value)}
              className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all outline-none"
            />
            <label className="absolute -top-2 left-2 px-1 text-xs text-gray-500 bg-white">
              Fecha Fin
            </label>
          </div>
        </div>

        {/* Botón limpiar filtros */}
        {(searchTerm || tipoSeleccionado || fechaInicio || fechaFin) && (
          <div className="flex justify-end">
            <button
              onClick={limpiarFiltros}
              className="text-sm text-gray-600 hover:text-gray-900 flex items-center gap-1"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
              Limpiar filtros
            </button>
          </div>
        )}
      </div>

      {/* Lista de Movimientos */}
      <div className="grid gap-4">
        {loading ? (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600 mx-auto"></div>
          </div>
        ) : filteredMovimientos.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            No se encontraron movimientos
          </div>
        ) : (
          filteredMovimientos.map((movimiento) => (
            <ItemMovimiento
              key={movimiento.id}
              movimiento={movimiento}
              onDelete={handleDelete}
              onEdit={handleEdit}
            />
          ))
        )}
      </div>

      {/* Modal de Crear/Editar Movimiento */}
      <MovimientoModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false)
          setSelectedMovimiento(undefined)
        }}
        onSuccess={loadData}
        movimiento={selectedMovimiento}
      />
    </div>
  )
} 