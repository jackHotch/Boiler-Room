'use client'

import { useEffect } from 'react'
import { useTheme } from 'next-themes'
import axios from 'axios'
import { usePathname } from 'next/navigation'

export function ThemeInitializer() {
  const { theme, setTheme } = useTheme()
  const pathname = usePathname()
  const unauthenticatedUrls = ['/', '/LoginRedirect', /^\/Search/, /^\/SingleGame/]

  function matchesAnyPattern(str, patterns) {
    return patterns.some((pattern) => {
      if (pattern instanceof RegExp) {
        return pattern.test(str)
      }
      return str === pattern
    })
  }

  useEffect(() => {
    async function fetchUserPreference() {
      if (!matchesAnyPattern(pathname, unauthenticatedUrls)) {
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
    }
    fetchUserPreference()
  }, [])

  return null
}
