'use client'

import { ThemeProvider as NextThemeProvider } from 'next-themes'
import { useState, useEffect } from 'react'

export function ThemeProvider({ children }) {
  const [mounted, setMounted] = useState(false)

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
      {children}
    </NextThemeProvider>
  )
}
