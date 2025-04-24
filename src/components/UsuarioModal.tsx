import React, { useState, useEffect } from 'react'
import type { Usuario, NewUsuario, UpdateUsuario } from '../services/usuarios'
import { usuariosService } from '../services/usuarios'

interface UsuarioModalProps {
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
  usuario?: Usuario
}

const UsuarioModal: React.FC<UsuarioModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  usuario
}) => {
  const [formData, setFormData] = useState({
    username: '',
    password: ''
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (usuario) {
      setFormData({
        username: usuario.username,
        password: ''
      })
    } else {
      setFormData({
        username: '',
        password: ''
      })
    }
    setError(null)
  }, [usuario])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      if (usuario) {
        const updateData: UpdateUsuario = {
          username: formData.username,
          password: formData.password || undefined
        }
        await usuariosService.update(usuario.id, updateData)
      } else {
        const newData: NewUsuario = {
          username: formData.username,
          password: formData.password
        }
        await usuariosService.create(newData)
      }

      onSuccess()
      onClose()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al guardar el usuario')
    } finally {
      setLoading(false)
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
        <h2 className="text-xl font-semibold mb-4">
          {usuario ? 'Editar Usuario' : 'Nuevo Usuario'}
        </h2>

        <form onSubmit={handleSubmit}>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Nombre de usuario
              </label>
              <input
                type="text"
                value={formData.username}
                onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                className="w-full appearance-none rounded-lg bg-white px-4 py-2.5 text-gray-700 shadow-sm border border-gray-200 focus:border-gray-400 focus:outline-none"
                placeholder="Nombre de usuario"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Contraseña
              </label>
              <input
                type="password"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                className="w-full appearance-none rounded-lg bg-white px-4 py-2.5 text-gray-700 shadow-sm border border-gray-200 focus:border-gray-400 focus:outline-none"
                placeholder={usuario ? 'Dejar en blanco para mantener la contraseña actual' : 'Contraseña'}
                required={!usuario}
              />
            </div>

            {error && (
              <div className="text-red-600 text-sm">{error}</div>
            )}
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
              {loading ? 'Guardando...' : usuario ? 'Guardar Cambios' : 'Crear Usuario'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default UsuarioModal 