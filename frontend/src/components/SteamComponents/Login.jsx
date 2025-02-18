const handleLogin = () => {
  window.location.href = `${process.env.NEXT_PUBLIC_BACKEND}/auth/steam` // This will trigger the backend to redirect to Steam
}

export default function Login() {
  return (
    <button className='steamLogin' onClick={handleLogin}>
      Login
    </button>
  )
}
