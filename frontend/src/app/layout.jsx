import './globals.css'
import { Navbar } from '@/components/Navbar/Navbar'
import Button from '@/components/Button/Button'
import { ThemeProvider } from '@/providers/ThemeProvider'

export const metadata = {
  title: 'BoilerRoom',
}

export default function RootLayout({ children }) {
  return (
    <html lang='en'>
      <body>
        <div className='bubbles-bg'></div>
        <ThemeProvider>
          <Navbar />
          {children}
          <Button />
        </ThemeProvider>
      </body>
    </html>
  )
}
