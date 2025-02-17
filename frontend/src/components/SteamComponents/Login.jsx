const handleLogin = () => {
  window.location.href = 'http://localhost:8080/auth/steam'; // This will trigger the backend to redirect to Steam
};

export default function Login() {
  return (
    <button className="steamLogin" onClick={handleLogin}>
      Login
    </button>
  );
}
