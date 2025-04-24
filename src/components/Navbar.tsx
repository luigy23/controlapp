import { Link, useNavigate } from 'react-router-dom'
import { authService } from '../services/auth'

const Navbar = () => {
  const navigate = useNavigate()
  const currentUser = authService.getCurrentUser()

  const handleSignOut = async () => {
    try {
      await authService.signOut()
      navigate('/login')
    } catch (error) {
      console.error('Error al cerrar sesión:', error)
    }
  }

  return (
    <nav className="bg-white shadow-sm">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center">
            <Link to="/" className="text-xl font-semibold text-gray-800">
              ControlApp
            </Link>
          </div>
          <div className="flex items-center space-x-4">
            <Link
              to="/productos"
              className="text-gray-600 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium"
            >
              Productos
            </Link>
            <Link
              to="/categorias"
              className="text-gray-600 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium"
            >
              Categorías
            </Link>
            <Link
              to="/movimientos"
              className="text-gray-600 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium"
            >
              Movimientos
            </Link>
            <Link
              to="/usuarios"
              className="text-gray-600 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium"
            >
              Usuarios
            </Link>
            <div className="flex items-center space-x-2">
              <span className="text-gray-600 text-sm">
                {currentUser?.username}
              </span>
              <button
                onClick={handleSignOut}
                className="text-red-600 hover:text-red-900 px-3 py-2 rounded-md text-sm font-medium"
              >
                Cerrar Sesión
              </button>
            </div>
          </div>
        </div>
      </div>
    </nav>
  )
}

export default Navbar 