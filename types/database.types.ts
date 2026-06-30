// Tipos generados a mano a partir de supabase/schema.sql.
// Si en el futuro se usa `supabase gen types typescript`, este archivo puede reemplazarse.

export type Ciudad = "Lechería" | "Barcelona" | "Puerto La Cruz" | "Guanta";

export type EstadoCentro = "activo" | "inactivo";

export type EstadoZona =
  | "abastecido"
  | "parcialmente_abastecido"
  | "no_abastecido";

export type CategoriaInventario =
  | "agua"
  | "alimentos_no_perecederos"
  | "medicinas"
  | "higiene"
  | "ropa"
  | "otros";

export type UnidadInventario = "kg" | "litros" | "unidades" | "cajas";

export type Prioridad = "alta" | "media" | "baja";

export type EstadoNecesidad = "abierta" | "en_proceso" | "cubierta";

export type RolUsuario =
  | "operador"
  | "jefe_centro"
  | "logistica"
  | "voluntario";

export interface Database {
  public: {
    Tables: {
      centros_acopio: {
        Row: {
          id: string;
          nombre: string;
          slug: string;
          descripcion: string | null;
          ciudad: Ciudad;
          lat: number;
          lng: number;
          estado: EstadoCentro;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          nombre: string;
          slug: string;
          descripcion?: string | null;
          ciudad: Ciudad;
          lat: number;
          lng: number;
          estado?: EstadoCentro;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["centros_acopio"]["Insert"]>;
        Relationships: [];
      };
      depositos: {
        Row: {
          id: string;
          centro_acopio_id: string;
          nombre: string;
          ubicacion: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          centro_acopio_id: string;
          nombre: string;
          ubicacion?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["depositos"]["Insert"]>;
        Relationships: [
          {
            foreignKeyName: "depositos_centro_acopio_id_fkey";
            columns: ["centro_acopio_id"];
            isOneToOne: false;
            referencedRelation: "centros_acopio";
            referencedColumns: ["id"];
          },
        ];
      };
      inventario: {
        Row: {
          id: string;
          deposito_id: string;
          categoria: CategoriaInventario;
          item: string;
          cantidad: number;
          unidad: UnidadInventario;
          updated_at: string;
          updated_by: string | null;
        };
        Insert: {
          id?: string;
          deposito_id: string;
          categoria: CategoriaInventario;
          item: string;
          cantidad: number;
          unidad: UnidadInventario;
          updated_at?: string;
          updated_by?: string | null;
        };
        Update: Partial<Database["public"]["Tables"]["inventario"]["Insert"]>;
        Relationships: [
          {
            foreignKeyName: "inventario_deposito_id_fkey";
            columns: ["deposito_id"];
            isOneToOne: false;
            referencedRelation: "depositos";
            referencedColumns: ["id"];
          },
        ];
      };
      zonas_refugio: {
        Row: {
          id: string;
          nombre: string;
          ciudad: Ciudad;
          encargado_nombre: string | null;
          encargado_contacto: string | null;
          lat: number;
          lng: number;
          estado: EstadoZona;
          updated_at: string;
          updated_by: string | null;
        };
        Insert: {
          id?: string;
          nombre: string;
          ciudad: Ciudad;
          encargado_nombre?: string | null;
          encargado_contacto?: string | null;
          lat: number;
          lng: number;
          estado?: EstadoZona;
          updated_at?: string;
          updated_by?: string | null;
        };
        Update: Partial<Database["public"]["Tables"]["zonas_refugio"]["Insert"]>;
        Relationships: [];
      };
      cobertura_centro_zona: {
        Row: {
          centro_acopio_id: string;
          zona_refugio_id: string;
          created_at: string;
        };
        Insert: {
          centro_acopio_id: string;
          zona_refugio_id: string;
          created_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["cobertura_centro_zona"]["Insert"]>;
        Relationships: [
          {
            foreignKeyName: "cobertura_centro_zona_centro_acopio_id_fkey";
            columns: ["centro_acopio_id"];
            isOneToOne: false;
            referencedRelation: "centros_acopio";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "cobertura_centro_zona_zona_refugio_id_fkey";
            columns: ["zona_refugio_id"];
            isOneToOne: false;
            referencedRelation: "zonas_refugio";
            referencedColumns: ["id"];
          },
        ];
      };
      necesidades: {
        Row: {
          id: string;
          zona_refugio_id: string;
          item: string;
          cantidad_requerida: number;
          prioridad: Prioridad;
          estado: EstadoNecesidad;
          created_by: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          zona_refugio_id: string;
          item: string;
          cantidad_requerida: number;
          prioridad?: Prioridad;
          estado?: EstadoNecesidad;
          created_by?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["necesidades"]["Insert"]>;
        Relationships: [
          {
            foreignKeyName: "necesidades_zona_refugio_id_fkey";
            columns: ["zona_refugio_id"];
            isOneToOne: false;
            referencedRelation: "zonas_refugio";
            referencedColumns: ["id"];
          },
        ];
      };
      perfiles: {
        Row: {
          id: string;
          nombre_completo: string;
          rol: RolUsuario;
          centro_acopio_id: string | null;
          telefono: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          nombre_completo: string;
          rol?: RolUsuario;
          centro_acopio_id?: string | null;
          telefono?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["perfiles"]["Insert"]>;
        Relationships: [
          {
            foreignKeyName: "perfiles_centro_acopio_id_fkey";
            columns: ["centro_acopio_id"];
            isOneToOne: false;
            referencedRelation: "centros_acopio";
            referencedColumns: ["id"];
          },
        ];
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: {
      ciudad_enum: Ciudad;
      estado_centro_enum: EstadoCentro;
      estado_zona_enum: EstadoZona;
      categoria_inventario_enum: CategoriaInventario;
      unidad_inventario_enum: UnidadInventario;
      prioridad_enum: Prioridad;
      estado_necesidad_enum: EstadoNecesidad;
      rol_usuario_enum: RolUsuario;
    };
    CompositeTypes: Record<string, never>;
  };
}
