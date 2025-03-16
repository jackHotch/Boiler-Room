'use client'

import { ThemeProvider as NextThemeProvider } from 'next-themes'
import { useState, useEffect } from 'react'
import { ThemeInitializer } from './ThemeInitializer'
import { usePathname } from 'next/navigation'

export function ThemeProvider({ children }) {
  const [mounted, setMounted] = useState(false)
  const pathname = usePathname()

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return <>{/* Avoid hydration mismatch */}</>
  }

  return (
    <NextThemeProvider
      attribute='class'
      defaultTheme='dark'
      value={{
        light: 'light',
        dark: 'dark',
      }}
    >
      {pathname != '/' && <ThemeInitializer />}
      {children}
    </NextThemeProvider>
  )
}
