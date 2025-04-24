export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      productos: {
        Row: {
          id: number
          descripcion: string
          stock: number
          costo: number
          precio: number
          created_at: string
          categoria: number
        }
        Insert: {
          id?: number
          descripcion: string
          stock: number
          costo: number
          precio: number
          created_at?: string
          categoria: number
        }
        Update: {
          id?: number
          descripcion?: string
          stock?: number
          costo?: number
          precio?: number
          created_at?: string
          categoria?: number
        }
      }
      categorias: {
        Row: {
          id: number
          nombre: string
          descripcion: string | null
          created_at: string
          is_active: boolean
        }
        Insert: {
          id?: number
          nombre: string
          descripcion?: string
          created_at?: string
          is_active?: boolean
        }
        Update: {
          id?: number
          nombre?: string
          descripcion?: string
          created_at?: string
          is_active?: boolean
        }
      }
      movimientos: {
        Row: {
          id: number
          producto_id: number
          tipo: string
          cantidad: number
          precio_unitario: number
          total: number
          descripcion: string | null
          created_at: string
          usuario: string
          referencia: string | null
          motivo: string | null
        }
        Insert: {
          id?: number
          producto_id: number
          tipo: string
          cantidad: number
          precio_unitario: number
          total?: number
          descripcion?: string
          created_at?: string
          usuario: string
          referencia?: string
          motivo?: string
        }
        Update: {
          id?: number
          producto_id?: number
          tipo?: string
          cantidad?: number
          precio_unitario?: number
          total?: number
          descripcion?: string
          created_at?: string
          usuario?: string
          referencia?: string
          motivo?: string
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
  }
} 