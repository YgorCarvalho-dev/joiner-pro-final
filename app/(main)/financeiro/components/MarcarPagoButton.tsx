'use client';

import { useState } from 'react';
import { CheckCircle, Loader2 } from 'lucide-react';

interface MarcarPagoButtonProps {
  contaId: string;
  tipo: 'pagar' | 'receber';
  status: string;
  onSuccess: () => void;
}

export function MarcarPagoButton({ contaId, tipo, status, onSuccess }: MarcarPagoButtonProps) {
  const [loading, setLoading] = useState(false);

  const handleMarcarPago = async () => {
    if (status === 'PAGO' || status === 'RECEBIDO') return;

    setLoading(true);
    try {
      const endpoint = tipo === 'pagar' ? '/api/contas-pagar' : '/api/contas-receber';
      const response = await fetch(endpoint, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ id: contaId }),
      });

      if (response.ok) {
        onSuccess();
      } else {
        alert('Erro ao marcar conta como paga');
      }
    } catch (error) {
      console.error('Erro:', error);
      alert('Erro ao marcar conta como paga');
    } finally {
      setLoading(false);
    }
  };

  const isPago = status === 'PAGO' || status === 'RECEBIDO';

  return (
    <button
      onClick={handleMarcarPago}
      disabled={loading || isPago}
      className={`ml-2 p-1 rounded transition-colors ${
        isPago
          ? 'text-green-500 cursor-not-allowed'
          : 'text-gray-400 hover:text-green-500 hover:bg-green-50'
      }`}
      title={isPago ? 'Já foi pago' : 'Marcar como pago'}
    >
      {loading ? (
        <Loader2 size={16} className="animate-spin" />
      ) : (
        <CheckCircle size={16} />
      )}
    </button>
  );
}