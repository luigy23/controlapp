import { supabase } from '../utils/supabase'
import type { Database } from '../utils/supabase.types'

type Producto = Database['public']['Tables']['productos']['Row']
type NewProducto = Database['public']['Tables']['productos']['Insert']
type UpdateProducto = Database['public']['Tables']['productos']['Update']

export const productosService = {
  // Obtener todos los productos
  async getAll() {
    const { data, error } = await supabase
      .from('productos')
      .select('*')
      .order('created_at', { ascending: false })
    
    if (error) throw error
    return data as Producto[]
  },

  // Obtener un producto por ID
  async getById(id: number) {
    const { data, error } = await supabase
      .from('productos')
      .select('*')
      .eq('id', id)
      .single()
    
    if (error) throw error
    return data as Producto
  },

  // Crear un nuevo producto
  async create(producto: NewProducto) {
    const { data, error } = await supabase
      .from('productos')
      .insert(producto)
      .select()
      .single()
    
    if (error) throw error
    return data as Producto
  },

  // Actualizar un producto
  async update(id: number, producto: UpdateProducto) {
    const { data, error } = await supabase
      .from('productos')
      .update(producto)
      .eq('id', id)
      .select()
      .single()
    
    if (error) throw error
    return data as Producto
  },

  // Eliminar un producto
  async delete(id: number) {
    const { error } = await supabase
      .from('productos')
      .delete()
      .eq('id', id)
    
    if (error) throw error
  },

  // Obtener productos por categoría
  async getByCategoria(categoriaId: number) {
    const { data, error } = await supabase
      .from('productos')
      .select('*')
      .eq('categoria', categoriaId)
      .order('created_at', { ascending: false })
    
    if (error) throw error
    return data as Producto[]
  }
} 