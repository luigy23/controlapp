import { supabase } from '../utils/supabase'
import type { Database } from '../utils/supabase.types'

type Categoria = Database['public']['Tables']['categorias']['Row']
type NewCategoria = Database['public']['Tables']['categorias']['Insert']
type UpdateCategoria = Database['public']['Tables']['categorias']['Update']

export const categoriasService = {
  // Obtener todas las categorías
  async getAll() {
    const { data, error } = await supabase
      .from('categorias')
      .select('*')
      .order('created_at', { ascending: false })
    
    if (error) throw error
    return data as Categoria[]
  },

  // Obtener una categoría por ID
  async getById(id: number) {
    const { data, error } = await supabase
      .from('categorias')
      .select('*')
      .eq('id', id)
      .single()
    
    if (error) throw error
    return data as Categoria
  },

  // Crear una nueva categoría
  async create(categoria: NewCategoria) {
    const { data, error } = await supabase
      .from('categorias')
      .insert(categoria)
      .select()
      .single()
    
    if (error) throw error
    return data as Categoria
  },

  // Actualizar una categoría
  async update(id: number, categoria: UpdateCategoria) {
    const { data, error } = await supabase
      .from('categorias')
      .update(categoria)
      .eq('id', id)
      .select()
      .single()
    
    if (error) throw error
    return data as Categoria
  },

  // Eliminar una categoría
  async delete(id: number) {
    const { error } = await supabase
      .from('categorias')
      .delete()
      .eq('id', id)
    
    if (error) throw error
  },

  // Obtener categorías activas
  async getActive() {
    const { data, error } = await supabase
      .from('categorias')
      .select('*')
      .eq('is_active', true)
      .order('created_at', { ascending: false })
    
    if (error) throw error
    return data as Categoria[]
  }
} 