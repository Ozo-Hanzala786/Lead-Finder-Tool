import { createContext, useContext, useState, useEffect, ReactNode } from 'react'

interface ThemeContextType {
  dark: boolean
  toggle: () => void
  agencyName: string
  setAgencyName: (name: string) => void
}

const ThemeContext = createContext<ThemeContextType>({
  dark: false,
  toggle: () => {},
  agencyName: 'Chasmish Agency',
  setAgencyName: () => {},
})

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [dark, setDark] = useState(() => localStorage.getItem('theme') === 'dark')
  const [agencyName, setAgencyName] = useState(() => localStorage.getItem('agencyName') || 'Chasmish Agency')

  const toggle = () => {
    setDark((d) => {
      const next = !d
      localStorage.setItem('theme', next ? 'dark' : 'light')
      return next
    })
  }

  const updateAgencyName = (name: string) => {
    setAgencyName(name)
    localStorage.setItem('agencyName', name)
  }

  return (
    <ThemeContext.Provider value={{ dark, toggle, agencyName, setAgencyName: updateAgencyName }}>
      {children}
    </ThemeContext.Provider>
  )
}

export const useTheme = () => useContext(ThemeContext)

