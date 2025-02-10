import './globals.css'
import { Navbar } from '@/components/Navbar/Navbar'

export const metadata = {
  title: 'BoilerRoom',
}

export default function RootLayout({ children }) {
  return (
    <html lang='en'>
      <body>
        <Navbar />
        {children}
      </body>
    </html>
  )
}
