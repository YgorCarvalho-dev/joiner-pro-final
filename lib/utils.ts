// lib/utils.ts

/**
 * Formata um valor numérico para moeda brasileira (R$)
 * @param value - Valor numérico a ser formatado
 * @returns String formatada no padrão brasileiro (R$ 1.234,56)
 */
export function formatCurrency(value: number): string {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(value);
}

/**
 * Formata um valor numérico para moeda brasileira sem o símbolo R$
 * @param value - Valor numérico a ser formatado
 * @returns String formatada no padrão brasileiro (1.234,56)
 */
export function formatCurrencyValue(value: number): string {
  return new Intl.NumberFormat('pt-BR', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
}