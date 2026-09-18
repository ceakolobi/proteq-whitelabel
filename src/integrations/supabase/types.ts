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
    PostgrestVersion: "14.1"
  }
  public: {
    Tables: {
      comissoes: {
        Row: {
          created_at: string
          data_pagamento: string | null
          id: string
          indicacao_id: string
          indicador_id: string
          pago: boolean | null
          valor: number
        }
        Insert: {
          created_at?: string
          data_pagamento?: string | null
          id?: string
          indicacao_id: string
          indicador_id: string
          pago?: boolean | null
          valor: number
        }
        Update: {
          created_at?: string
          data_pagamento?: string | null
          id?: string
          indicacao_id?: string
          indicador_id?: string
          pago?: boolean | null
          valor?: number
        }
        Relationships: [
          {
            foreignKeyName: "comissoes_indicacao_id_fkey"
            columns: ["indicacao_id"]
            isOneToOne: false
            referencedRelation: "indicacoes"
            referencedColumns: ["id"]
          },
        ]
      }
      consultor_comissoes: {
        Row: {
          cliente_nome: string
          consultor_id: string
          cotacao_id: string | null
          created_at: string
          data_aprovacao: string | null
          data_pagamento: string | null
          id: string
          mes_referencia: string
          observacoes: string | null
          proposta_id: string | null
          status: string
          tipo: string
          updated_at: string
          valor: number
        }
        Insert: {
          cliente_nome: string
          consultor_id: string
          cotacao_id?: string | null
          created_at?: string
          data_aprovacao?: string | null
          data_pagamento?: string | null
          id?: string
          mes_referencia?: string
          observacoes?: string | null
          proposta_id?: string | null
          status?: string
          tipo?: string
          updated_at?: string
          valor?: number
        }
        Update: {
          cliente_nome?: string
          consultor_id?: string
          cotacao_id?: string | null
          created_at?: string
          data_aprovacao?: string | null
          data_pagamento?: string | null
          id?: string
          mes_referencia?: string
          observacoes?: string | null
          proposta_id?: string | null
          status?: string
          tipo?: string
          updated_at?: string
          valor?: number
        }
        Relationships: [
          {
            foreignKeyName: "consultor_comissoes_cotacao_id_fkey"
            columns: ["cotacao_id"]
            isOneToOne: false
            referencedRelation: "cotacoes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "consultor_comissoes_proposta_id_fkey"
            columns: ["proposta_id"]
            isOneToOne: false
            referencedRelation: "propostas"
            referencedColumns: ["id"]
          },
        ]
      }
      cotacoes: {
        Row: {
          cliente_cpf: string | null
          cliente_email: string | null
          cliente_nome: string
          cliente_telefone: string
          compartilhada: boolean | null
          consultor_id: string
          created_at: string
          id: string
          indicacao_id: string | null
          lead_descartado: boolean | null
          lead_descartado_em: string | null
          lead_descartado_motivo: string | null
          observacoes: string | null
          status: Database["public"]["Enums"]["cotacao_status"]
          token_compartilhamento: string | null
          updated_at: string
          validade_cotacao: string | null
          valor_mensal: number | null
          veiculo_ano: number | null
          veiculo_modelo: string
          veiculo_placa: string
        }
        Insert: {
          cliente_cpf?: string | null
          cliente_email?: string | null
          cliente_nome: string
          cliente_telefone: string
          compartilhada?: boolean | null
          consultor_id: string
          created_at?: string
          id?: string
          indicacao_id?: string | null
          lead_descartado?: boolean | null
          lead_descartado_em?: string | null
          lead_descartado_motivo?: string | null
          observacoes?: string | null
          status?: Database["public"]["Enums"]["cotacao_status"]
          token_compartilhamento?: string | null
          updated_at?: string
          validade_cotacao?: string | null
          valor_mensal?: number | null
          veiculo_ano?: number | null
          veiculo_modelo: string
          veiculo_placa: string
        }
        Update: {
          cliente_cpf?: string | null
          cliente_email?: string | null
          cliente_nome?: string
          cliente_telefone?: string
          compartilhada?: boolean | null
          consultor_id?: string
          created_at?: string
          id?: string
          indicacao_id?: string | null
          lead_descartado?: boolean | null
          lead_descartado_em?: string | null
          lead_descartado_motivo?: string | null
          observacoes?: string | null
          status?: Database["public"]["Enums"]["cotacao_status"]
          token_compartilhamento?: string | null
          updated_at?: string
          validade_cotacao?: string | null
          valor_mensal?: number | null
          veiculo_ano?: number | null
          veiculo_modelo?: string
          veiculo_placa?: string
        }
        Relationships: [
          {
            foreignKeyName: "cotacoes_indicacao_id_fkey"
            columns: ["indicacao_id"]
            isOneToOne: false
            referencedRelation: "indicacoes"
            referencedColumns: ["id"]
          },
        ]
      }
      idempotency_keys: {
        Row: {
          created_at: string
          endpoint: string
          expires_at: string
          id: string
          idempotency_key: string
          request_hash: string
          response_body: Json | null
          response_status: number | null
          user_id: string
        }
        Insert: {
          created_at?: string
          endpoint: string
          expires_at?: string
          id?: string
          idempotency_key: string
          request_hash: string
          response_body?: Json | null
          response_status?: number | null
          user_id: string
        }
        Update: {
          created_at?: string
          endpoint?: string
          expires_at?: string
          id?: string
          idempotency_key?: string
          request_hash?: string
          response_body?: Json | null
          response_status?: number | null
          user_id?: string
        }
        Relationships: []
      }
      indicacoes: {
        Row: {
          consultor_id: string | null
          created_at: string
          email_indicado: string | null
          id: string
          indicador_id: string
          modelo_veiculo: string | null
          nome_indicado: string
          observacoes: string | null
          placa_veiculo: string | null
          status: Database["public"]["Enums"]["indicacao_status"]
          telefone_indicado: string
          updated_at: string
        }
        Insert: {
          consultor_id?: string | null
          created_at?: string
          email_indicado?: string | null
          id?: string
          indicador_id: string
          modelo_veiculo?: string | null
          nome_indicado: string
          observacoes?: string | null
          placa_veiculo?: string | null
          status?: Database["public"]["Enums"]["indicacao_status"]
          telefone_indicado: string
          updated_at?: string
        }
        Update: {
          consultor_id?: string | null
          created_at?: string
          email_indicado?: string | null
          id?: string
          indicador_id?: string
          modelo_veiculo?: string | null
          nome_indicado?: string
          observacoes?: string | null
          placa_veiculo?: string | null
          status?: Database["public"]["Enums"]["indicacao_status"]
          telefone_indicado?: string
          updated_at?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          codigo_indicador: string | null
          cpf: string | null
          created_at: string
          email: string | null
          id: string
          nome: string
          regional_id: string | null
          telefone: string | null
          updated_at: string
        }
        Insert: {
          avatar_url?: string | null
          codigo_indicador?: string | null
          cpf?: string | null
          created_at?: string
          email?: string | null
          id: string
          nome: string
          regional_id?: string | null
          telefone?: string | null
          updated_at?: string
        }
        Update: {
          avatar_url?: string | null
          codigo_indicador?: string | null
          cpf?: string | null
          created_at?: string
          email?: string | null
          id?: string
          nome?: string
          regional_id?: string | null
          telefone?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "profiles_regional_id_fkey"
            columns: ["regional_id"]
            isOneToOne: false
            referencedRelation: "regionais"
            referencedColumns: ["id"]
          },
        ]
      }
      propostas: {
        Row: {
          aceita: boolean | null
          consultor_id: string
          cotacao_id: string
          created_at: string
          id: string
          observacoes: string | null
          updated_at: string
          valor_adesao: number | null
          valor_mensal: number
        }
        Insert: {
          aceita?: boolean | null
          consultor_id: string
          cotacao_id: string
          created_at?: string
          id?: string
          observacoes?: string | null
          updated_at?: string
          valor_adesao?: number | null
          valor_mensal: number
        }
        Update: {
          aceita?: boolean | null
          consultor_id?: string
          cotacao_id?: string
          created_at?: string
          id?: string
          observacoes?: string | null
          updated_at?: string
          valor_adesao?: number | null
          valor_mensal?: number
        }
        Relationships: [
          {
            foreignKeyName: "propostas_cotacao_id_fkey"
            columns: ["cotacao_id"]
            isOneToOne: false
            referencedRelation: "cotacoes"
            referencedColumns: ["id"]
          },
        ]
      }
      rate_limit_logs: {
        Row: {
          created_at: string
          endpoint: string
          id: string
          request_count: number
          user_id: string | null
          window_start: string
        }
        Insert: {
          created_at?: string
          endpoint: string
          id?: string
          request_count?: number
          user_id?: string | null
          window_start?: string
        }
        Update: {
          created_at?: string
          endpoint?: string
          id?: string
          request_count?: number
          user_id?: string | null
          window_start?: string
        }
        Relationships: []
      }
      regionais: {
        Row: {
          ativo: boolean
          codigo: string
          created_at: string
          id: string
          nome: string
          updated_at: string
        }
        Insert: {
          ativo?: boolean
          codigo: string
          created_at?: string
          id?: string
          nome: string
          updated_at?: string
        }
        Update: {
          ativo?: boolean
          codigo?: string
          created_at?: string
          id?: string
          nome?: string
          updated_at?: string
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
      veiculos: {
        Row: {
          ano: number | null
          chassi: string | null
          cor: string | null
          created_at: string
          id: string
          modelo: string
          placa: string
          updated_at: string
          user_id: string
        }
        Insert: {
          ano?: number | null
          chassi?: string | null
          cor?: string | null
          created_at?: string
          id?: string
          modelo: string
          placa: string
          updated_at?: string
          user_id: string
        }
        Update: {
          ano?: number | null
          chassi?: string | null
          cor?: string | null
          created_at?: string
          id?: string
          modelo?: string
          placa?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      check_rate_limit: {
        Args: {
          _endpoint: string
          _max_requests: number
          _user_id: string
          _window_seconds: number
        }
        Returns: boolean
      }
      check_role_with_limit: {
        Args: {
          _endpoint: string
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: Json
      }
      cleanup_rate_limit_logs: { Args: never; Returns: undefined }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "associado" | "consultor" | "indicador"
      cotacao_status:
        | "aberta"
        | "em_analise"
        | "proposta_enviada"
        | "aprovada"
        | "recusada"
      indicacao_status:
        | "novo"
        | "em_negociacao"
        | "proposta_enviada"
        | "fechado"
        | "cancelado"
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
      app_role: ["associado", "consultor", "indicador"],
      cotacao_status: [
        "aberta",
        "em_analise",
        "proposta_enviada",
        "aprovada",
        "recusada",
      ],
      indicacao_status: [
        "novo",
        "em_negociacao",
        "proposta_enviada",
        "fechado",
        "cancelado",
      ],
    },
  },
} as const
