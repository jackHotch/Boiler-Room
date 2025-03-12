const handleLogin = () => {
  window.location.href = `${process.env.NEXT_PUBLIC_BACKEND}/auth/steam` // This will trigger the backend to redirect to Steam
}

export default function Login() {
  return (
    <button
      className='steamLogin'
      onClick={handleLogin}
      style={{
        background: 'rgba(255, 255, 255, 0.1)', // Light transparent white for glass effect
        border: '1px solid rgba(255, 255, 255, 0.3)', // Soft white border
        color: '#fff', // White text
        fontSize: '16px',
        padding: '10px 20px',
        borderRadius: '8px',
        cursor: 'pointer',
        transition: 'all 0.3s ease-in-out',
        backdropFilter: 'blur(5px)', // Slight frosted effect
      }}
      onMouseOver={(e) => (e.target.style.background = 'rgba(255, 255, 255, 0.2)')} // Hover effect
      onMouseOut={(e) => (e.target.style.background = 'rgba(255, 255, 255, 0.1)')}
    >
      Log in with Steam
    </button>
  )
}
