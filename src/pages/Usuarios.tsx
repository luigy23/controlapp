import { useState, useEffect } from 'react'
import type { Usuario } from '../services/usuarios'
import { usuariosService } from '../services/usuarios'
import UsuarioModal from '../components/UsuarioModal'
import ItemUsuario from '../components/Usuarios/ItemUsuario'

export default function Usuarios() {
  const [usuarios, setUsuarios] = useState<Usuario[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [selectedUsuario, setSelectedUsuario] = useState<Usuario | undefined>()
  const [loading, setLoading] = useState(true)

  const loadData = async () => {
    try {
      const data = await usuariosService.getAll()
      setUsuarios(data)
    } catch (error) {
      console.error('Error al cargar usuarios:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [])

  const handleEdit = (usuario: Usuario) => {
    setSelectedUsuario(usuario)
    setIsModalOpen(true)
  }

  const handleDelete = async (id: number) => {
    if (window.confirm('¿Estás seguro de que deseas eliminar este usuario?')) {
      try {
        await usuariosService.delete(id)
        await loadData()
      } catch (error) {
        console.error('Error al eliminar usuario:', error)
      }
    }
  }

  const filteredUsuarios = usuarios.filter(usuario =>
    usuario.username.toLowerCase().includes(searchTerm.toLowerCase())
  )

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-semibold text-gray-800">Usuarios</h1>
        <button
          onClick={() => {
            setSelectedUsuario(undefined)
            setIsModalOpen(true)
          }}
          className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
          </svg>
          Nuevo Usuario
        </button>
      </div>

      {/* Buscador */}
      <div className="mb-6">
        <input
          type="text"
          placeholder="Buscar usuarios..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full max-w-md px-4 py-2 rounded-lg border border-gray-200 focus:border-gray-400 focus:outline-none"
        />
      </div>

      {/* Lista de usuarios */}
      <div className="grid gap-4">
        {loading ? (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600 mx-auto"></div>
          </div>
        ) : filteredUsuarios.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            No se encontraron usuarios
          </div>
        ) : (
          filteredUsuarios.map((usuario) => (
            <ItemUsuario
              key={usuario.id}
              usuario={usuario}
              onDelete={handleDelete}
              onEdit={handleEdit}
            />
          ))
        )}
      </div>

      {/* Modal de Crear/Editar Usuario */}
      <UsuarioModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false)
          setSelectedUsuario(undefined)
        }}
        onSuccess={loadData}
        usuario={selectedUsuario}
      />
    </div>
  )
} 