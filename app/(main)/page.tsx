// app/(main)/page.tsx

import React from 'react';

export default function DashboardPage() {
  return (
    <div>
      <h1 className="text-3xl font-bold mb-6 text-gray-800">
        Dashboard
      </h1>
      <p className="text-gray-600 mb-8">
        Visão geral e indicadores chave da sua produção e finanças.
      </p>

      {/* Exemplo de Card */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-lg shadow-md border-l-4 border-blue-500">
          <h2 className="text-xl font-semibold text-gray-700 mb-2">Projetos Ativos</h2>
          <p className="text-4xl font-extrabold text-blue-600">12</p>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-md border-l-4 border-green-500">
          <h2 className="text-xl font-semibold text-gray-700 mb-2">Estoque Crítico</h2>
          <p className="text-4xl font-extrabold text-green-600">3 Itens</p>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-md border-l-4 border-red-500">
          <h2 className="text-xl font-semibold text-gray-700 mb-2">Contas a Pagar (7 dias)</h2>
          <p className="text-4xl font-extrabold text-red-600">R$ 5.400,00</p>
        </div>
      </div>
    </div>
  );
}