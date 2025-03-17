import './globals.css'
import { Navbar } from '@/components/Navbar/Navbar'
import Button from "@/components/Button/Button"; 





export const metadata = {
  title: 'BoilerRoom',
}


export default function RootLayout({ children }) {
  return (
    <html lang='en'>
      <body>
        <Navbar />
        {children}
        <Button />
      </body> 
      
    </html>
  )
}
