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
    <header className='header h-16 px-6 flex items-center justify-between'>
      {/* Search Section */}
      <div className='flex items-center flex-1 max-w-xl'>
        <div className='hidden md:block p-6 border-b border-slate-200'>
          <div className='flex items-center gap-3'>
            {/* <div className="p-2 bg-indigo-600 rounded-lg">
            <BarChart3 className="h-5 w-5 text-white" />
          </div> */}
            <div>
              <h1 className='font-semibold text-slate-900'>MRR</h1>
              <p className='text-xs text-slate-500'>Revenue Analytics</p>
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
              className='btn-ghost flex items-center gap-3 px-3 py-2'
            >
              <div className='h-8 w-8 bg-indigo-600 rounded-full flex items-center justify-center'>
                <User className='h-4 w-4 text-white' />
              </div>
              {user && (
                <div className='text-left hidden sm:block'>
                  <p className='text-sm font-medium text-slate-900'>
                    {user.name}
                  </p>
                  <p className='text-xs text-slate-500'>{user.email}</p>
                </div>
              )}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            align='end'
            className='dropdown-content w-56 bg-white'
          >
            <DropdownMenuItem className='dropdown-item'>
              <User className='mr-2 h-4 w-4' />
              Profile
            </DropdownMenuItem>
            <DropdownMenuItem className='dropdown-item'>
              <Settings className='mr-2 h-4 w-4' />
              Settings
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={handleLogout}
              className='dropdown-item text-red-600 hover:bg-red-50'
            >
              <LogOut className='mr-2 h-4 w-4' />
              Sign out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  )
}
