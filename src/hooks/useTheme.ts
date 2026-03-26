import { useEffect, useState } from 'react'

type Theme = 'light' | 'dark'

const THEME_STORAGE_KEY = 'wedding-planner-theme'

const getInitialTheme = (): Theme => {
  if (!globalThis.window) return 'light'
  
  const stored = localStorage.getItem(THEME_STORAGE_KEY) as Theme | null
  
  if (stored === 'dark' || stored === 'light') {
    return stored
  }
  
  return globalThis.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
}

const applyThemeToDOM = (theme: Theme) => {
  if (!globalThis.window) return
  
  const html = document.documentElement
  if (theme === 'dark') {
    html.classList.add('dark')
  } else {
    html.classList.remove('dark')
  }
}

export function useTheme() {
  const [theme, setTheme] = useState<Theme>(() => {
    const initialTheme = getInitialTheme()
    // Başlangıçta DOM'a hemen tema uygulanır
    applyThemeToDOM(initialTheme)
    localStorage.setItem(THEME_STORAGE_KEY, initialTheme)
    return initialTheme
  })

  // Theme değiştiğinde DOM ve localStorage'u güncelle
  useEffect(() => {
    applyThemeToDOM(theme)
    localStorage.setItem(THEME_STORAGE_KEY, theme)
  }, [theme])

  const toggleTheme = () => {
    setTheme((prev) => (prev === 'light' ? 'dark' : 'light'))
  }

  return { theme, toggleTheme }
}
