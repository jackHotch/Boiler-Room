'use client'

import { useEffect } from 'react'
import { useTheme } from 'next-themes'
import axios from 'axios'

export function ThemeInitializer() {
  const { theme, setTheme } = useTheme()

  useEffect(() => {
    async function fetchUserPreference() {
      try {
        const res = await axios.get(
          process.env.NEXT_PUBLIC_BACKEND + '/themepreference',
          { withCredentials: true }
        )

        setTheme(res.data.preference == 0 ? 'dark' : 'light')
      } catch (err) {
        console.error(err)
      }
    }
    fetchUserPreference()
  }, [])

  return null
}
