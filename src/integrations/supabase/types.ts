export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.15"
  }
  public: {
    Tables: {
      empresas: {
        Row: {
          created_at: string
          id: string
          nome: string
          slug: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          nome: string
          slug: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          nome?: string
          slug?: string
          updated_at?: string
        }
        Relationships: []
      }
      fotos_visita: {
        Row: {
          caminho_arquivo: string
          data_envio: string
          id: string
          legenda: string | null
          visita_id: string
        }
        Insert: {
          caminho_arquivo: string
          data_envio?: string
          id?: string
          legenda?: string | null
          visita_id: string
        }
        Update: {
          caminho_arquivo?: string
          data_envio?: string
          id?: string
          legenda?: string | null
          visita_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "fotos_visita_visita_id_fkey"
            columns: ["visita_id"]
            isOneToOne: false
            referencedRelation: "visitas"
            referencedColumns: ["id"]
          },
        ]
      }
      itens_visita: {
        Row: {
          created_at: string
          id: string
          observacoes: string | null
          preco: number | null
          produto_id: string
          quantidade_estimada: number | null
          status: Database["public"]["Enums"]["item_visita_status"]
          updated_at: string
          visita_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          observacoes?: string | null
          preco?: number | null
          produto_id: string
          quantidade_estimada?: number | null
          status: Database["public"]["Enums"]["item_visita_status"]
          updated_at?: string
          visita_id: string
        }
        Update: {
          created_at?: string
          id?: string
          observacoes?: string | null
          preco?: number | null
          produto_id?: string
          quantidade_estimada?: number | null
          status?: Database["public"]["Enums"]["item_visita_status"]
          updated_at?: string
          visita_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "itens_visita_produto_id_fkey"
            columns: ["produto_id"]
            isOneToOne: false
            referencedRelation: "produtos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "itens_visita_visita_id_fkey"
            columns: ["visita_id"]
            isOneToOne: false
            referencedRelation: "visitas"
            referencedColumns: ["id"]
          },
        ]
      }
      lojas: {
        Row: {
          cidade: string | null
          created_at: string
          empresa_id: string
          endereco: string | null
          estado: string | null
          id: string
          latitude: number | null
          longitude: number | null
          nome: string
          rede: string | null
          regiao: string | null
          updated_at: string
        }
        Insert: {
          cidade?: string | null
          created_at?: string
          empresa_id: string
          endereco?: string | null
          estado?: string | null
          id?: string
          latitude?: number | null
          longitude?: number | null
          nome: string
          rede?: string | null
          regiao?: string | null
          updated_at?: string
        }
        Update: {
          cidade?: string | null
          created_at?: string
          empresa_id?: string
          endereco?: string | null
          estado?: string | null
          id?: string
          latitude?: number | null
          longitude?: number | null
          nome?: string
          rede?: string | null
          regiao?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "lojas_empresa_id_fkey"
            columns: ["empresa_id"]
            isOneToOne: false
            referencedRelation: "empresas"
            referencedColumns: ["id"]
          },
        ]
      }
      produtos: {
        Row: {
          categoria: string | null
          created_at: string
          empresa_id: string
          id: string
          marca: string | null
          nome: string
          sku: string | null
          updated_at: string
        }
        Insert: {
          categoria?: string | null
          created_at?: string
          empresa_id: string
          id?: string
          marca?: string | null
          nome: string
          sku?: string | null
          updated_at?: string
        }
        Update: {
          categoria?: string | null
          created_at?: string
          empresa_id?: string
          id?: string
          marca?: string | null
          nome?: string
          sku?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "produtos_empresa_id_fkey"
            columns: ["empresa_id"]
            isOneToOne: false
            referencedRelation: "empresas"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          cargo: string | null
          created_at: string
          email: string
          empresa_id: string
          foto_url: string | null
          id: string
          nome: string
          tipo: Database["public"]["Enums"]["app_role"]
          updated_at: string
        }
        Insert: {
          cargo?: string | null
          created_at?: string
          email: string
          empresa_id: string
          foto_url?: string | null
          id: string
          nome: string
          tipo: Database["public"]["Enums"]["app_role"]
          updated_at?: string
        }
        Update: {
          cargo?: string | null
          created_at?: string
          email?: string
          empresa_id?: string
          foto_url?: string | null
          id?: string
          nome?: string
          tipo?: Database["public"]["Enums"]["app_role"]
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "profiles_empresa_id_fkey"
            columns: ["empresa_id"]
            isOneToOne: false
            referencedRelation: "empresas"
            referencedColumns: ["id"]
          },
        ]
      }
      promotores: {
        Row: {
          created_at: string
          empresa_id: string
          id: string
          perfil_id: string
          regiao: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          empresa_id: string
          id?: string
          perfil_id: string
          regiao?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          empresa_id?: string
          id?: string
          perfil_id?: string
          regiao?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "promotores_empresa_id_fkey"
            columns: ["empresa_id"]
            isOneToOne: false
            referencedRelation: "empresas"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "promotores_perfil_id_fkey"
            columns: ["perfil_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      roteiros: {
        Row: {
          created_at: string
          data_prevista: string
          empresa_id: string
          horario_previsto: string | null
          id: string
          loja_id: string
          promotor_id: string
          status: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          data_prevista: string
          empresa_id: string
          horario_previsto?: string | null
          id?: string
          loja_id: string
          promotor_id: string
          status?: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          data_prevista?: string
          empresa_id?: string
          horario_previsto?: string | null
          id?: string
          loja_id?: string
          promotor_id?: string
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "roteiros_empresa_id_fkey"
            columns: ["empresa_id"]
            isOneToOne: false
            referencedRelation: "empresas"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "roteiros_loja_id_fkey"
            columns: ["loja_id"]
            isOneToOne: false
            referencedRelation: "lojas"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "roteiros_promotor_id_fkey"
            columns: ["promotor_id"]
            isOneToOne: false
            referencedRelation: "promotores"
            referencedColumns: ["id"]
          },
        ]
      }
      visitas: {
        Row: {
          created_at: string
          empresa_id: string
          fim: string | null
          id: string
          inicio: string
          latitude: number | null
          loja_id: string
          longitude: number | null
          nota_execucao: number | null
          observacoes: string | null
          promotor_id: string
          roteiro_id: string | null
          status: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          empresa_id: string
          fim?: string | null
          id?: string
          inicio?: string
          latitude?: number | null
          loja_id: string
          longitude?: number | null
          nota_execucao?: number | null
          observacoes?: string | null
          promotor_id: string
          roteiro_id?: string | null
          status: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          empresa_id?: string
          fim?: string | null
          id?: string
          inicio?: string
          latitude?: number | null
          loja_id?: string
          longitude?: number | null
          nota_execucao?: number | null
          observacoes?: string | null
          promotor_id?: string
          roteiro_id?: string | null
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "visitas_empresa_id_fkey"
            columns: ["empresa_id"]
            isOneToOne: false
            referencedRelation: "empresas"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "visitas_loja_id_fkey"
            columns: ["loja_id"]
            isOneToOne: false
            referencedRelation: "lojas"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "visitas_promotor_id_fkey"
            columns: ["promotor_id"]
            isOneToOne: false
            referencedRelation: "promotores"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "visitas_roteiro_id_fkey"
            columns: ["roteiro_id"]
            isOneToOne: false
            referencedRelation: "roteiros"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      get_my_empresa_id: { Args: never; Returns: string }
      is_gestor: { Args: never; Returns: boolean }
    }
    Enums: {
      app_role: "gestor" | "promotor"
      item_visita_status:
        | "em_estoque"
        | "estoque_baixo"
        | "ruptura"
        | "nao_encontrado"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      app_role: ["gestor", "promotor"],
      item_visita_status: [
        "em_estoque",
        "estoque_baixo",
        "ruptura",
        "nao_encontrado",
      ],
    },
  },
} as const
