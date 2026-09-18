/**
 * Tipos do CRM - Contrato Oficial
 * 
 * Este arquivo define os tipos baseados no JSON retornado pelo CRM.
 * O APP apenas consome estes tipos - nenhuma regra local.
 */

// Permissões granulares do usuário (definidas pelo CRM)
export interface PermissoesCRM {
  cotar: boolean;
  ver_leads: boolean;
  editar_leads: boolean;
  ver_comissoes: boolean;
  ajuste_manual: boolean;
}

// Regional do usuário
export interface RegionalCRM {
  id: number;
  nome: string;
}

// Perfil completo do usuário retornado pelo CRM
export interface PerfilCRM {
  id: number;
  nome: string;
  perfil: "CONSULTOR" | "INDICADOR" | "ASSOCIADO" | "ADMIN";
  regional: RegionalCRM | null;
  permissoes: PermissoesCRM;
}

// Tipo para checagem de permissão específica
export type PermissaoKey = keyof PermissoesCRM;
