import { supabase } from '../utils/supabase'

export type Usuario = {
  id: number
  username: string
  password: string
  created_at: string
}

export type NewUsuario = {
  username: string
  password: string
}

export type UpdateUsuario = {
  username?: string
  password?: string
}

export const usuariosService = {
  // Obtener todos los usuarios
  async getAll() {
    const { data, error } = await supabase
      .from('usuarios')
      .select('*')
      .order('created_at', { ascending: false })
    
    if (error) throw error
    return data as Usuario[]
  },

  // Obtener un usuario por ID
  async getById(id: number) {
    const { data, error } = await supabase
      .from('usuarios')
      .select('*')
      .eq('id', id)
      .single()
    
    if (error) throw error
    return data as Usuario
  },

  // Crear un nuevo usuario
  async create(usuario: NewUsuario) {
    const { data, error } = await supabase
      .from('usuarios')
      .insert(usuario)
      .select()
      .single()
    
    if (error) throw error
    return data as Usuario
  },

  // Actualizar un usuario
  async update(id: number, usuario: UpdateUsuario) {
    const { data, error } = await supabase
      .from('usuarios')
      .update(usuario)
      .eq('id', id)
      .select()
      .single()
    
    if (error) throw error
    return data as Usuario
  },

  // Eliminar un usuario
  async delete(id: number) {
    const { error } = await supabase
      .from('usuarios')
      .delete()
      .eq('id', id)
    
    if (error) throw error
  }
} 