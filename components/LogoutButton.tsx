'use client'

import { signOut } from 'next-auth/react'
import { LogOut } from 'lucide-react'

export function LogoutButton() {
  const handleLogout = () => {
    signOut({ callbackUrl: '/login' })
  }

  return (
    <button
      onClick={handleLogout}
      className="flex items-center gap-2 px-3 py-1 text-xs text-gray-400 hover:text-white hover:bg-gray-700 rounded transition-colors"
      title="Sair"
    >
      <LogOut size={14} />
      Sair
    </button>
  )
}