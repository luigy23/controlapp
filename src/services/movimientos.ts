import { supabase } from '../utils/supabase'
import type { Database } from '../utils/supabase.types'
import { productosService } from './productos'

type Movimiento = Database['public']['Tables']['movimientos']['Row']
type NewMovimiento = Database['public']['Tables']['movimientos']['Insert']
type UpdateMovimiento = Database['public']['Tables']['movimientos']['Update']

export const movimientosService = {
  // Obtener todos los movimientos
  async getAll() {
    const { data, error } = await supabase
      .from('movimientos')
      .select(`
        *,
        producto:productos (
          id,
          descripcion,
          stock,
          precio
        )
      `)
      .order('created_at', { ascending: false })
    
    if (error) throw error
    return data as (Movimiento & { producto: { id: number; descripcion: string; stock: number; precio: number } })[]
  },

  // Obtener un movimiento por ID
  async getById(id: number) {
    const { data, error } = await supabase
      .from('movimientos')
      .select(`
        *,
        producto:productos (
          id,
          descripcion,
          stock,
          precio
        )
      `)
      .eq('id', id)
      .single()
    
    if (error) throw error
    return data as Movimiento & { producto: { id: number; descripcion: string; stock: number; precio: number } }
  },

  // Crear un nuevo movimiento
  async create(movimiento: NewMovimiento) {
    // Verificar stock suficiente para salidas
    if (movimiento.tipo === 'salida') {
      const producto = await productosService.getById(movimiento.producto_id)
      if (producto.stock < movimiento.cantidad) {
        throw new Error(`Stock insuficiente. Stock actual: ${producto.stock}, Cantidad solicitada: ${movimiento.cantidad}`)
      }
    }

    // Iniciar transacción
    const { data: newMovimiento, error: movimientoError } = await supabase
      .from('movimientos')
      .insert(movimiento)
      .select()
      .single()
    
    if (movimientoError) throw movimientoError

    // Actualizar stock del producto
    const producto = await productosService.getById(movimiento.producto_id)
    let nuevoStock = producto.stock

    switch (movimiento.tipo) {
      case 'entrada':
        nuevoStock += movimiento.cantidad
        break
      case 'salida':
        nuevoStock -= movimiento.cantidad
        break
      case 'ajuste':
        nuevoStock = movimiento.cantidad
        break
    }

    await productosService.update(movimiento.producto_id, { stock: nuevoStock })

    return newMovimiento as Movimiento
  },

  // Actualizar un movimiento
  async update(id: number, movimiento: UpdateMovimiento) {
    // Obtener el movimiento actual
    const movimientoActual = await this.getById(id)
    
    // Si se está modificando la cantidad o el tipo, necesitamos revertir el stock anterior
    if (movimiento.cantidad !== undefined || movimiento.tipo !== undefined) {
      const producto = await productosService.getById(movimientoActual.producto_id)
      let stockActual = producto.stock

      // Revertir el movimiento anterior
      switch (movimientoActual.tipo) {
        case 'entrada':
          stockActual -= movimientoActual.cantidad
          break
        case 'salida':
          stockActual += movimientoActual.cantidad
          break
        case 'ajuste':
          stockActual = producto.stock // Mantener el stock actual
          break
      }

      // Aplicar el nuevo movimiento
      const nuevaCantidad = movimiento.cantidad ?? movimientoActual.cantidad
      const nuevoTipo = movimiento.tipo ?? movimientoActual.tipo

      // Verificar stock suficiente para salidas
      if (nuevoTipo === 'salida' && stockActual < nuevaCantidad) {
        throw new Error(`Stock insuficiente. Stock actual: ${stockActual}, Cantidad solicitada: ${nuevaCantidad}`)
      }

      switch (nuevoTipo) {
        case 'entrada':
          stockActual += nuevaCantidad
          break
        case 'salida':
          stockActual -= nuevaCantidad
          break
        case 'ajuste':
          stockActual = nuevaCantidad
          break
      }

      // Actualizar el stock
      await productosService.update(movimientoActual.producto_id, { stock: stockActual })
    }

    // Actualizar el movimiento
    const { data, error } = await supabase
      .from('movimientos')
      .update(movimiento)
      .eq('id', id)
      .select()
      .single()
    
    if (error) throw error
    return data as Movimiento
  },

  // Eliminar un movimiento
  async delete(id: number) {
    // Obtener el movimiento antes de eliminarlo
    const movimiento = await this.getById(id)
    
    // Revertir el efecto en el stock
    const producto = await productosService.getById(movimiento.producto_id)
    let nuevoStock = producto.stock

    switch (movimiento.tipo) {
      case 'entrada':
        nuevoStock -= movimiento.cantidad
        break
      case 'salida':
        nuevoStock += movimiento.cantidad
        break
      case 'ajuste':
        // No revertimos ajustes ya que no sabemos el valor anterior
        break
    }

    // Actualizar el stock
    await productosService.update(movimiento.producto_id, { stock: nuevoStock })

    // Eliminar el movimiento
    const { error } = await supabase
      .from('movimientos')
      .delete()
      .eq('id', id)
    
    if (error) throw error
  },

  // Obtener movimientos por producto
  async getByProducto(productoId: number) {
    const { data, error } = await supabase
      .from('movimientos')
      .select('*')
      .eq('producto_id', productoId)
      .order('created_at', { ascending: false })
    
    if (error) throw error
    return data as Movimiento[]
  },

  // Obtener movimientos por tipo
  async getByTipo(tipo: string) {
    const { data, error } = await supabase
      .from('movimientos')
      .select(`
        *,
        producto:productos (
          id,
          descripcion,
          stock,
          precio
        )
      `)
      .eq('tipo', tipo)
      .order('created_at', { ascending: false })
    
    if (error) throw error
    return data as (Movimiento & { producto: { id: number; descripcion: string; stock: number; precio: number } })[]
  },

  // Obtener movimientos por rango de fechas
  async getByDateRange(startDate: string, endDate: string) {
    const { data, error } = await supabase
      .from('movimientos')
      .select(`
        *,
        producto:productos (
          id,
          descripcion,
          stock,
          precio
        )
      `)
      .gte('created_at', startDate)
      .lte('created_at', endDate)
      .order('created_at', { ascending: false })
    
    if (error) throw error
    return data as (Movimiento & { producto: { id: number; descripcion: string; stock: number; precio: number } })[]
  }
} 