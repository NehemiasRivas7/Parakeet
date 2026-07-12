// Parakeet — tipos de la base de datos.
// Escritos a mano para coincidir con supabase/schema.sql.
// Regenerables con:
//   npx supabase gen types typescript --project-id <id> > src/lib/database.types.ts

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type RolUsuario = 'estudiante' | 'organizacion' | 'empresa' | 'admin';
export type NivelGravedad = 'recuperada' | 'bajo' | 'medio' | 'alto' | 'critico';
export type EstadoIniciativa =
  | 'borrador'
  | 'en_revision'
  | 'financiable'
  | 'financiada'
  | 'inscripcion_abierta'
  | 'en_curso'
  | 'completada'
  | 'cancelada';
export type TipoContaminacion =
  | 'basura'
  | 'plastico'
  | 'aguas_negras'
  | 'escombros'
  | 'otro';

export type Database = {
  public: {
    Tables: {
      usuarios: {
        Row: {
          id: string;
          email: string;
          rol: RolUsuario;
          nombre: string;
          creado_en: string | null;
        };
        Insert: {
          id: string;
          email: string;
          rol: RolUsuario;
          nombre: string;
          creado_en?: string | null;
        };
        Update: {
          id?: string;
          email?: string;
          rol?: RolUsuario;
          nombre?: string;
          creado_en?: string | null;
        };
        Relationships: [];
      };
      estudiantes: {
        Row: {
          id: string;
          usuario_id: string;
          institucion: string;
          horas_requeridas: number;
          horas_acumuladas: number;
        };
        Insert: {
          id?: string;
          usuario_id: string;
          institucion: string;
          horas_requeridas?: number;
          horas_acumuladas?: number;
        };
        Update: {
          id?: string;
          usuario_id?: string;
          institucion?: string;
          horas_requeridas?: number;
          horas_acumuladas?: number;
        };
        Relationships: [
          {
            foreignKeyName: 'estudiantes_usuario_id_fkey';
            columns: ['usuario_id'];
            referencedRelation: 'usuarios';
            referencedColumns: ['id'];
          },
        ];
      };
      organizaciones: {
        Row: {
          id: string;
          usuario_id: string;
          nombre: string;
          zona_cobertura: string | null;
          verificada: boolean;
        };
        Insert: {
          id?: string;
          usuario_id: string;
          nombre: string;
          zona_cobertura?: string | null;
          verificada?: boolean;
        };
        Update: {
          id?: string;
          usuario_id?: string;
          nombre?: string;
          zona_cobertura?: string | null;
          verificada?: boolean;
        };
        Relationships: [
          {
            foreignKeyName: 'organizaciones_usuario_id_fkey';
            columns: ['usuario_id'];
            referencedRelation: 'usuarios';
            referencedColumns: ['id'];
          },
        ];
      };
      empresas: {
        Row: {
          id: string;
          usuario_id: string;
          nombre: string;
          logo_url: string | null;
          verificada: boolean;
        };
        Insert: {
          id?: string;
          usuario_id: string;
          nombre: string;
          logo_url?: string | null;
          verificada?: boolean;
        };
        Update: {
          id?: string;
          usuario_id?: string;
          nombre?: string;
          logo_url?: string | null;
          verificada?: boolean;
        };
        Relationships: [
          {
            foreignKeyName: 'empresas_usuario_id_fkey';
            columns: ['usuario_id'];
            referencedRelation: 'usuarios';
            referencedColumns: ['id'];
          },
        ];
      };
      zonas: {
        Row: {
          id: string;
          nombre: string;
          lat_centro: number;
          lng_centro: number;
          radio_m: number;
          nivel_gravedad: NivelGravedad;
          nivel_inicial: NivelGravedad;
          total_reportes: number;
          actualizada_en: string | null;
        };
        Insert: {
          id?: string;
          nombre: string;
          lat_centro: number;
          lng_centro: number;
          radio_m?: number;
          nivel_gravedad?: NivelGravedad;
          nivel_inicial?: NivelGravedad;
          total_reportes?: number;
          actualizada_en?: string | null;
        };
        Update: {
          id?: string;
          nombre?: string;
          lat_centro?: number;
          lng_centro?: number;
          radio_m?: number;
          nivel_gravedad?: NivelGravedad;
          nivel_inicial?: NivelGravedad;
          total_reportes?: number;
          actualizada_en?: string | null;
        };
        Relationships: [];
      };
      reportes: {
        Row: {
          id: string;
          zona_id: string | null;
          lat: number;
          lng: number;
          tipo_contaminacion: TipoContaminacion;
          descripcion: string | null;
          foto_url: string | null;
          creado_en: string | null;
        };
        Insert: {
          id?: string;
          zona_id?: string | null;
          lat: number;
          lng: number;
          tipo_contaminacion: TipoContaminacion;
          descripcion?: string | null;
          foto_url?: string | null;
          creado_en?: string | null;
        };
        Update: {
          id?: string;
          zona_id?: string | null;
          lat?: number;
          lng?: number;
          tipo_contaminacion?: TipoContaminacion;
          descripcion?: string | null;
          foto_url?: string | null;
          creado_en?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: 'reportes_zona_id_fkey';
            columns: ['zona_id'];
            referencedRelation: 'zonas';
            referencedColumns: ['id'];
          },
        ];
      };
      iniciativas: {
        Row: {
          id: string;
          organizacion_id: string;
          zona_id: string | null;
          nombre: string;
          descripcion: string;
          tipo_causa: string;
          lat: number;
          lng: number;
          fecha_jornada: string;
          cupo_max: number;
          horas_otorgadas: number;
          monto_requerido: number;
          estado: EstadoIniciativa;
          motivo_cancelacion: string | null;
          creada_en: string | null;
        };
        Insert: {
          id?: string;
          organizacion_id: string;
          zona_id?: string | null;
          nombre: string;
          descripcion: string;
          tipo_causa: string;
          lat: number;
          lng: number;
          fecha_jornada: string;
          cupo_max: number;
          horas_otorgadas: number;
          monto_requerido: number;
          estado?: EstadoIniciativa;
          motivo_cancelacion?: string | null;
          creada_en?: string | null;
        };
        Update: {
          id?: string;
          organizacion_id?: string;
          zona_id?: string | null;
          nombre?: string;
          descripcion?: string;
          tipo_causa?: string;
          lat?: number;
          lng?: number;
          fecha_jornada?: string;
          cupo_max?: number;
          horas_otorgadas?: number;
          monto_requerido?: number;
          estado?: EstadoIniciativa;
          motivo_cancelacion?: string | null;
          creada_en?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: 'iniciativas_organizacion_id_fkey';
            columns: ['organizacion_id'];
            referencedRelation: 'organizaciones';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'iniciativas_zona_id_fkey';
            columns: ['zona_id'];
            referencedRelation: 'zonas';
            referencedColumns: ['id'];
          },
        ];
      };
      financiamientos: {
        Row: {
          id: string;
          iniciativa_id: string;
          empresa_id: string;
          monto: number;
          estado_pago: string;
          confirmado_en: string | null;
        };
        Insert: {
          id?: string;
          iniciativa_id: string;
          empresa_id: string;
          monto: number;
          estado_pago?: string;
          confirmado_en?: string | null;
        };
        Update: {
          id?: string;
          iniciativa_id?: string;
          empresa_id?: string;
          monto?: number;
          estado_pago?: string;
          confirmado_en?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: 'financiamientos_iniciativa_id_fkey';
            columns: ['iniciativa_id'];
            referencedRelation: 'iniciativas';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'financiamientos_empresa_id_fkey';
            columns: ['empresa_id'];
            referencedRelation: 'empresas';
            referencedColumns: ['id'];
          },
        ];
      };
      inscripciones: {
        Row: {
          id: string;
          iniciativa_id: string;
          estudiante_id: string;
          inscrito_en: string | null;
        };
        Insert: {
          id?: string;
          iniciativa_id: string;
          estudiante_id: string;
          inscrito_en?: string | null;
        };
        Update: {
          id?: string;
          iniciativa_id?: string;
          estudiante_id?: string;
          inscrito_en?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: 'inscripciones_iniciativa_id_fkey';
            columns: ['iniciativa_id'];
            referencedRelation: 'iniciativas';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'inscripciones_estudiante_id_fkey';
            columns: ['estudiante_id'];
            referencedRelation: 'estudiantes';
            referencedColumns: ['id'];
          },
        ];
      };
      asistencias: {
        Row: {
          id: string;
          inscripcion_id: string;
          asistio: boolean;
          horas_acreditadas: number;
          marcada_en: string | null;
        };
        Insert: {
          id?: string;
          inscripcion_id: string;
          asistio: boolean;
          horas_acreditadas?: number;
          marcada_en?: string | null;
        };
        Update: {
          id?: string;
          inscripcion_id?: string;
          asistio?: boolean;
          horas_acreditadas?: number;
          marcada_en?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: 'asistencias_inscripcion_id_fkey';
            columns: ['inscripcion_id'];
            referencedRelation: 'inscripciones';
            referencedColumns: ['id'];
          },
        ];
      };
      resultados_jornada: {
        Row: {
          id: string;
          iniciativa_id: string;
          metrica: string;
          valor: number;
          unidad: string;
          registrado_en: string | null;
        };
        Insert: {
          id?: string;
          iniciativa_id: string;
          metrica: string;
          valor: number;
          unidad: string;
          registrado_en?: string | null;
        };
        Update: {
          id?: string;
          iniciativa_id?: string;
          metrica?: string;
          valor?: number;
          unidad?: string;
          registrado_en?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: 'resultados_jornada_iniciativa_id_fkey';
            columns: ['iniciativa_id'];
            referencedRelation: 'iniciativas';
            referencedColumns: ['id'];
          },
        ];
      };
      stamps: {
        Row: {
          id: string;
          estudiante_id: string;
          iniciativa_id: string;
          tipo: string;
          otorgado_en: string | null;
        };
        Insert: {
          id?: string;
          estudiante_id: string;
          iniciativa_id: string;
          tipo: string;
          otorgado_en?: string | null;
        };
        Update: {
          id?: string;
          estudiante_id?: string;
          iniciativa_id?: string;
          tipo?: string;
          otorgado_en?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: 'stamps_estudiante_id_fkey';
            columns: ['estudiante_id'];
            referencedRelation: 'estudiantes';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'stamps_iniciativa_id_fkey';
            columns: ['iniciativa_id'];
            referencedRelation: 'iniciativas';
            referencedColumns: ['id'];
          },
        ];
      };
    };
    Views: Record<never, never>;
    Functions: Record<never, never>;
    Enums: {
      rol_usuario: RolUsuario;
      nivel_gravedad: NivelGravedad;
      estado_iniciativa: EstadoIniciativa;
      tipo_contaminacion: TipoContaminacion;
    };
    CompositeTypes: Record<never, never>;
  };
};

// Atajos utiles para el resto del codigo
export type Tables<T extends keyof Database['public']['Tables']> =
  Database['public']['Tables'][T]['Row'];
export type TablesInsert<T extends keyof Database['public']['Tables']> =
  Database['public']['Tables'][T]['Insert'];
export type TablesUpdate<T extends keyof Database['public']['Tables']> =
  Database['public']['Tables'][T]['Update'];
