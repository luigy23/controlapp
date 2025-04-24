import { supabase } from '../utils/supabase'

export const authService = {
  // Iniciar sesión
  async signIn(username: string, password: string) {
    const { data, error } = await supabase
      .from('usuarios')
      .select('*')
      .eq('username', username)
      .eq('password', password)
      .single()

    if (error) throw error
    if (!data) throw new Error('Usuario o contraseña incorrectos')
    
    // Guardar el usuario en localStorage
    localStorage.setItem('user', JSON.stringify(data))
    return data
  },

  // Cerrar sesión
  async signOut() {
    localStorage.removeItem('user')
  },

  // Obtener usuario actual
  getCurrentUser() {
    const user = localStorage.getItem('user')
    return user ? JSON.parse(user) : null
  },

  // Verificar si el usuario está autenticado
  isAuthenticated() {
    return !!this.getCurrentUser()
  }
} 