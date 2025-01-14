import './globals.css'

export const metadata = {
  title: 'BoilerRoom',
}

export default function RootLayout({ children }) {
  return (
    <html lang='en'>
      <body>{children}</body>
    </html>
  )
}
