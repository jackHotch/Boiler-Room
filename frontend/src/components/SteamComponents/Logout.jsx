const handleLogin = () => {
  window.location.href = 'http://localhost:8080/steam/logout'; // This will trigger the backend to redirect to Steam
};

export default function Logout() {
  return (
    <button className="steamLogin" onClick={handleLogin}>
      Logout
    </button>
  );
}
