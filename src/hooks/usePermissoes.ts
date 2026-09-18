import { useAuth } from "@/contexts/AuthContext";
import type { PermissaoKey } from "@/types/crm";

/**
 * Hook para verificar permissões do usuário
 * 
 * As permissões são definidas exclusivamente pelo CRM.
 * O frontend apenas obedece o JSON - não cria regras próprias.
 */
export function usePermissoes() {
  const { perfilCRM, isLoadingPerfil } = useAuth();

  /**
   * Verifica se o usuário tem uma permissão específica
   * Retorna false se o perfil ainda não foi carregado ou não existe
   */
  const temPermissao = (permissao: PermissaoKey): boolean => {
    if (!perfilCRM?.permissoes) return false;
    return perfilCRM.permissoes[permissao] === true;
  };

  /**
   * Verifica múltiplas permissões (AND - todas devem ser true)
   */
  const temTodasPermissoes = (permissoes: PermissaoKey[]): boolean => {
    return permissoes.every(p => temPermissao(p));
  };

  /**
   * Verifica múltiplas permissões (OR - pelo menos uma deve ser true)
   */
  const temAlgumaPermissao = (permissoes: PermissaoKey[]): boolean => {
    return permissoes.some(p => temPermissao(p));
  };

  /**
   * Retorna o perfil do usuário (CONSULTOR, INDICADOR, etc.)
   */
  const getPerfil = () => perfilCRM?.perfil ?? null;

  /**
   * Retorna a regional do usuário
   */
  const getRegional = () => perfilCRM?.regional ?? null;

  /**
   * Verifica se é um perfil específico
   */
  const isPerfil = (tipo: "CONSULTOR" | "INDICADOR" | "ASSOCIADO" | "ADMIN"): boolean => {
    return perfilCRM?.perfil === tipo;
  };

  return {
    // Estado
    perfilCRM,
    isLoading: isLoadingPerfil,
    
    // Helpers de permissão
    temPermissao,
    temTodasPermissoes,
    temAlgumaPermissao,
    
    // Helpers de perfil
    getPerfil,
    getRegional,
    isPerfil,
    
    // Atalhos comuns
    podeCotar: temPermissao("cotar"),
    podeVerLeads: temPermissao("ver_leads"),
    podeEditarLeads: temPermissao("editar_leads"),
    podeVerComissoes: temPermissao("ver_comissoes"),
    podeAjusteManual: temPermissao("ajuste_manual"),
  };
}
