import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <header className="border-b bg-white">
      <div className="mx-auto max-w-6xl px-4 py-4 flex items-center justify-between">
        <button
          onClick={() => navigate("/")}
          className="text-xl font-bold tracking-tight text-gray-900"
        >
          Digital Voting System
        </button>

        <nav className="flex items-center gap-2">
          {user ? (
            <>

              <Link
                to="/profile"
                className="hidden sm:inline-flex rounded-lg px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100"
              >
                Profile
              </Link>
              {user?.isAdmin && (<Link
                to="/list-candidates"
                className="hidden sm:inline-flex rounded-lg px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100"
              >
                Dashboard
              </Link>)
              }
              <Link
                to="/add-vote"
                className="hidden sm:inline-flex rounded-lg px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100"
              >
                Vote
              </Link>
              <Link
                to="/my-vote"
                className="hidden sm:inline-flex rounded-lg px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100"
              >
                My Vote
              </Link>

              <button
                onClick={handleLogout}
                className="inline-flex rounded-lg bg-red-600 px-3 py-2 text-sm font-medium text-white hover:bg-red-700"
              >
                Logout
              </button>
            </>
          ) : (
            <>
              <Link
                to="/login"
                className="inline-flex rounded-lg bg-blue-600 px-3 py-2 text-sm font-medium text-white hover:bg-blue-700"
              >
                Login
              </Link>
              <Link
                to="/register"
                className="inline-flex rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
              >
                Register
              </Link>
            </>
          )}
        </nav>
      </div>
    </header>
  );
};

export default Navbar;
