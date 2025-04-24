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

  // Prevenir scroll del body cuando el modal está abierto
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = 'unset'
    }
    return () => {
      document.body.style.overflow = 'unset'
    }
  }, [isOpen])

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
      className="fixed inset-0 bg-black/55 z-50"
      onClick={handleOverlayClick}
    >
      <div className="fixed inset-0 flex items-center justify-center p-4 sm:p-6">
        <div className="w-full max-w-2xl mx-auto">
          <div className="bg-white rounded-xl shadow-xl transform transition-all max-h-[calc(100vh-32px)] flex flex-col">
            {/* Header */}
            <div className="flex justify-between items-center p-4 sm:p-6 border-b border-gray-200 flex-shrink-0">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-emerald-100 rounded-lg">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                </div>
                <h2 className="text-xl font-bold text-gray-900">
                  {usuario ? 'Editar Usuario' : 'Nuevo Usuario'}
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

            {/* Content with scroll */}
            <div className="flex-1 overflow-y-auto">
              <form id="usuario-form" onSubmit={handleSubmit} className="p-4 sm:p-6">
                {error && (
                  <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center space-x-2">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-red-500" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                    <p className="text-sm text-red-700">{error}</p>
                  </div>
                )}

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Nombre de Usuario
                    </label>
                    <input
                      type="text"
                      value={formData.username}
                      onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                      className="w-full appearance-none rounded-lg bg-white px-4 py-3 text-gray-700 shadow-sm border border-gray-200 placeholder-gray-400 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 focus:outline-none transition-all"
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
                      className="w-full appearance-none rounded-lg bg-white px-4 py-3 text-gray-700 shadow-sm border border-gray-200 placeholder-gray-400 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 focus:outline-none transition-all"
                      placeholder={usuario ? 'Dejar en blanco para mantener la actual' : 'Contraseña'}
                      {...(!usuario && { required: true })}
                    />
                  </div>
                </div>
              </form>
            </div>

            {/* Footer */}
            <div className="border-t border-gray-200 p-4 sm:p-6 bg-gray-50 flex flex-col sm:flex-row justify-end gap-3 flex-shrink-0">
              <button
                type="button"
                onClick={onClose}
                className="w-full sm:w-auto px-6 py-3 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-200 transition-colors"
              >
                Cancelar
              </button>
              <button
                type="submit"
                form="usuario-form"
                disabled={loading}
                className="w-full sm:w-auto px-6 py-3 text-sm font-medium text-white bg-emerald-600 rounded-lg hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Guardando...' : usuario ? 'Guardar Cambios' : 'Crear Usuario'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default UsuarioModal 