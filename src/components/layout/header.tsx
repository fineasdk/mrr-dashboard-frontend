'use client'

import { useState, useEffect } from 'react'
import {
  Search,
  Bell,
  Settings,
  User,
  LogOut,
  Sun,
  Moon,
  Command,
  BarChart3,
} from 'lucide-react'
import { Button } from '../ui/button'
import { Input } from '../ui/input'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '../ui/dropdown-menu'
import { authApi } from '@/lib/api'

interface HeaderProps {
  onLogout: () => void
}

interface UserData {
  id: number
  name: string
  email: string
}

export function Header({ onLogout }: HeaderProps) {
  const [user, setUser] = useState<UserData | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [isDarkMode, setIsDarkMode] = useState(false)

  useEffect(() => {
    const fetchUserData = async () => {
      const token = localStorage.getItem('auth_token')
      if (!token) return

      try {
        const response = await authApi.me()
        setUser(response.data)
      } catch (error) {
        console.error('Failed to fetch user data:', error)
      }
    }

    fetchUserData()
  }, [])

  const handleLogout = async () => {
    const token = localStorage.getItem('auth_token')
    if (token) {
      try {
        await authApi.logout()
      } catch (error) {
        console.error('Logout error:', error)
      }
    }

    localStorage.removeItem('auth_token')
    onLogout()
  }

  const toggleTheme = () => {
    setIsDarkMode(!isDarkMode)
    document.documentElement.classList.toggle('dark')
  }

  return (
    <header className='sticky top-0 z-50 bg-white/95 backdrop-blur-lg border-b border-slate-200/80 h-16 px-6 flex items-center justify-between shadow-sm'>
      {/* Enhanced Brand Section */}
      <div className='flex items-center flex-1 max-w-xl'>
        <div className='hidden md:block'>
          <div className='flex items-center gap-3'>
            {/* <div className="p-2 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-xl shadow-lg">
              <BarChart3 className="h-5 w-5 text-white" />
            </div> */}
            <div>
              <h1 className='font-bold text-slate-900 text-lg'>FINEAS</h1>
              <p className='text-xs text-slate-500 font-medium'>MRR Dashboard</p>
            </div>
          </div>
        </div>
      </div>

      {/* Actions Section */}
      <div className='flex items-center gap-2 ml-6'>
        {/* User Menu */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant='ghost'
              className='flex items-center gap-3 px-3 py-2 rounded-xl hover:bg-slate-100 transition-all duration-200'
            >
              <div className='h-9 w-9 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-full flex items-center justify-center shadow-lg ring-2 ring-white'>
                <User className='h-4 w-4 text-white' />
              </div>
              {user && (
                <div className='text-left hidden sm:block'>
                  <p className='text-sm font-semibold text-slate-900'>
                    {user.name}
                  </p>
                  <p className='text-xs text-slate-500'>{user.email}</p>
                </div>
              )}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            align='end'
            className='w-56 bg-white/95 backdrop-blur-lg border border-slate-200 shadow-xl rounded-xl p-2'
          >
            <DropdownMenuItem
              onClick={handleLogout}
              className='flex items-center gap-3 px-3 py-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors duration-200 cursor-pointer'
            >
              <LogOut className='h-4 w-4' />
              <span className='font-medium'>Sign out</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  )
}
