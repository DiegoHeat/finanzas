import { useState } from 'react'
import { useAuth } from '../hooks/useAuth'
import './Auth.css'

function Auth() {
  const { signIn, signUp } = useAuth()
  const [isSignUp, setIsSignUp] = useState(false)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    if (isSignUp) {
      if (password !== confirmPassword) {
        setError('Las contraseñas no coinciden')
        setLoading(false)
        return
      }

      if (password.length < 6) {
        setError('La contraseña debe tener al menos 6 caracteres')
        setLoading(false)
        return
      }

      const result = await signUp(email, password)
      if (!result.success) {
        setError(result.error || 'Error al crear la cuenta')
      }
    } else {
      const result = await signIn(email, password)
      if (!result.success) {
        setError(result.error || 'Error al iniciar sesión')
      }
    }

    setLoading(false)
  }

  return (
    <div className="auth-container">
      <div className="auth-card">
        <h2>{isSignUp ? 'Crear Cuenta' : 'Iniciar Sesión'}</h2>
        <p className="auth-subtitle">
          {isSignUp 
            ? 'Crea una cuenta para sincronizar tus datos en todos tus dispositivos'
            : 'Inicia sesión para acceder a tus finanzas desde cualquier dispositivo'
          }
        </p>

        <form onSubmit={handleSubmit} className="auth-form">
          <div className="form-group">
            <label htmlFor="email">Email:</label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              placeholder="tu@email.com"
              disabled={loading}
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">Contraseña:</label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              placeholder="Mínimo 6 caracteres"
              disabled={loading}
              minLength={6}
            />
          </div>

          {isSignUp && (
            <div className="form-group">
              <label htmlFor="confirmPassword">Confirmar Contraseña:</label>
              <input
                id="confirmPassword"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                placeholder="Repite tu contraseña"
                disabled={loading}
                minLength={6}
              />
            </div>
          )}

          {error && <div className="error-message">{error}</div>}

          <button 
            type="submit" 
            className="btn-auth"
            disabled={loading}
          >
            {loading ? 'Cargando...' : (isSignUp ? 'Crear Cuenta' : 'Iniciar Sesión')}
          </button>
        </form>

        <div className="auth-switch">
          <button
            type="button"
            onClick={() => {
              setIsSignUp(!isSignUp)
              setError('')
              setPassword('')
              setConfirmPassword('')
            }}
            className="btn-link"
          >
            {isSignUp 
              ? '¿Ya tienes cuenta? Inicia sesión'
              : '¿No tienes cuenta? Crear una'
            }
          </button>
        </div>
      </div>
    </div>
  )
}

export default Auth
