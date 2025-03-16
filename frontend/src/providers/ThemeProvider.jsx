'use client'

import axios from 'axios'
import { ThemeProvider as NextThemeProvider } from 'next-themes'
import { useState, useEffect } from 'react'
import { usePathname } from 'next/navigation'
import { useTheme } from 'next-themes'

export function ThemeProvider({ children }) {
  const [mounted, setMounted] = useState(false)
  const pathname = usePathname()
  const { theme, setTheme } = useTheme()

  // async function fetchUserPreference() {
  //   if (pathname != '/') {
  //     try {
  //       const res = await axios.get(
  //         process.env.NEXT_PUBLIC_BACKEND + '/themepreference',
  //         {
  //           withCredentials: true,
  //         }
  //       )
  //       console.log(res.preference)

  //       setTheme(res.preference == 0 ? 'dark' : 'light')
  //     } catch (err) {
  //       console.error(err)
  //     }
  //   }
  // }

  useEffect(() => {
    setMounted(true)
    // async function getUserPreference() {
    //   await fetchUserPreference()
    // }
    // getUserPreference()
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
