import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import './App.css'
import Productos from './pages/Productos'
import Categorias from './pages/Categorias'
import Movimientos from './pages/Movimientos'
import Usuarios from './pages/Usuarios'
import Login from './pages/Login'
import Navbar from './components/Navbar'
import ProtectedRoute from './components/ProtectedRoute'

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-gray-50">
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route
            path="/"
            element={
              <ProtectedRoute>
                <>
                  <Navbar />
                  <main className="py-4">
                    <Productos />
                  </main>
                </>
              </ProtectedRoute>
            }
          />
          <Route
            path="/productos"
            element={
              <ProtectedRoute>
                <>
                  <Navbar />
                  <main className="py-4">
                    <Productos />
                  </main>
                </>
              </ProtectedRoute>
            }
          />
          <Route
            path="/categorias"
            element={
              <ProtectedRoute>
                <>
                  <Navbar />
                  <main className="py-4">
                    <Categorias />
                  </main>
                </>
              </ProtectedRoute>
            }
          />
          <Route
            path="/movimientos"
            element={
              <ProtectedRoute>
                <>
                  <Navbar />
                  <main className="py-4">
                    <Movimientos />
                  </main>
                </>
              </ProtectedRoute>
            }
          />
          <Route
            path="/usuarios"
            element={
              <ProtectedRoute>
                <>
                  <Navbar />
                  <main className="py-4">
                    <Usuarios />
                  </main>
                </>
              </ProtectedRoute>
            }
          />
        </Routes>
      </div>
    </Router>
  )
}

export default App
