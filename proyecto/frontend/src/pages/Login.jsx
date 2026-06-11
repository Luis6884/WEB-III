import { useState, useEffect, useRef } from 'react';
import { authService, captchaService } from '../services/api';

function Login({ onLoginSuccess }) {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [isRegistering, setIsRegistering] = useState(false);
    const [nombre, setNombre] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [passwordStrength, setPasswordStrength] = useState('');
    const [cargando, setCargando] = useState(false);
    
    // Estados para CAPTCHA
    const [captchaId, setCaptchaId] = useState('');
    const [captchaSvg, setCaptchaSvg] = useState('');
    const [captchaText, setCaptchaText] = useState('');

    const cargarCaptcha = async () => {
        try {
            const response = await captchaService.getCaptcha();
            setCaptchaId(response.data.captchaId);
            setCaptchaSvg(response.data.svg);
        } catch (error) {
            console.error('Error cargando CAPTCHA:', error);
        }
    };

    useEffect(() => {
        cargarCaptcha();
    }, []);

    const checkPasswordStrength = (pass) => {
        if (!pass) return '';
        let puntos = 0;
        if (pass.length >= 6) puntos++;
        if (/[A-Z]/.test(pass)) puntos++;
        if (/[0-9]/.test(pass)) puntos++;
        if (/[^A-Za-z0-9]/.test(pass)) puntos++;
        if (puntos <= 2) return 'débil';
        if (puntos === 3) return 'media';
        return 'fuerte';
    };

    const handleLogin = async (e) => {
        e.preventDefault();
        setError('');
        setCargando(true);
        
        if (!captchaId || !captchaText) {
            setError('❌ Complete el CAPTCHA');
            setCargando(false);
            return;
        }
        
        try {
            const res = await authService.login(email, password, captchaId, captchaText);
            if (res.data.token) {
                localStorage.setItem('token', res.data.token);
                localStorage.setItem('user', JSON.stringify(res.data.usuario));
                onLoginSuccess(res.data.usuario);
            }
        } catch (err) {
            console.error('Error login:', err);
            setError(err.response?.data?.error || '❌ Credenciales incorrectas');
            cargarCaptcha(); // Recargar CAPTCHA
            setCaptchaText('');
        } finally {
            setCargando(false);
        }
    };

    const handleRegister = async (e) => {
        e.preventDefault();
        setError('');
        
        if (password !== confirmPassword) {
            setError('❌ Las contraseñas no coinciden');
            return;
        }
        
        if (password.length < 6) {
            setError('❌ La contraseña debe tener al menos 6 caracteres');
            return;
        }
        
        try {
            await authService.registro({ nombre, email, password });
            setError('✅ Registro exitoso. Ahora inicia sesión.');
            setIsRegistering(false);
            setNombre('');
            setEmail('');
            setPassword('');
            setConfirmPassword('');
            setPasswordStrength('');
        } catch (err) {
            setError('❌ Error al registrar. El email puede estar en uso.');
        }
    };

    return (
        <div className="login-container">
            <div className="login-card">
                <div className="logo-section">
                    <div className="logo-icon">🔌</div>
                    <h1 className="logo-title">ElectroShop</h1>
                    <p className="logo-subtitle">Tu tienda de electrónica de confianza</p>
                </div>

                {error && <div className={`mensaje-flotante ${error.includes('✅') ? 'exito' : 'error'}`}>{error}</div>}

                {!isRegistering ? (
                    <div className="form-section">
                        <h2>Bienvenido</h2>
                        <p className="form-desc">Inicia sesión en tu cuenta</p>
                        
                        <div className="input-group">
                            <span className="input-icon">📧</span>
                            <input 
                                type="email"
                                placeholder="Correo electrónico" 
                                value={email} 
                                onChange={e => setEmail(e.target.value)}
                                disabled={cargando}
                            />
                        </div>

                        <div className="input-group">
                            <span className="input-icon">🔒</span>
                            <input 
                                type="password"
                                placeholder="Contraseña" 
                                value={password} 
                                onChange={e => setPassword(e.target.value)}
                                disabled={cargando}
                            />
                        </div>

                        {/* CAPTCHA */}
                        <div style={{ margin: '16px 0' }}>
                            <div dangerouslySetInnerHTML={{ __html: captchaSvg }} />
                            <input 
                                type="text"
                                placeholder="Ingresa el código de la imagen"
                                value={captchaText}
                                onChange={e => setCaptchaText(e.target.value)}
                                style={{
                                    width: '100%',
                                    padding: '10px',
                                    marginTop: '10px',
                                    border: '1px solid #ddd',
                                    borderRadius: '8px',
                                    fontSize: '14px'
                                }}
                            />
                            <button 
                                onClick={cargarCaptcha}
                                style={{
                                    marginTop: '8px',
                                    background: 'none',
                                    border: 'none',
                                    color: '#2196F3',
                                    cursor: 'pointer',
                                    fontSize: '12px'
                                }}
                            >
                                🔄 Actualizar CAPTCHA
                            </button>
                        </div>

                        <button className="btn-primary" onClick={handleLogin} disabled={cargando}>
                            {cargando ? 'Verificando...' : 'Ingresar'}
                        </button>

                        <p className="link-text">
                            ¿No tienes cuenta?{' '}
                            <span onClick={() => setIsRegistering(true)}>Regístrate aquí</span>
                        </p>
                    </div>
                ) : (
                    <div className="form-section">
                        <h2>Crear cuenta</h2>
                        <p className="form-desc">Regístrate para comenzar</p>

                        <div className="input-group">
                            <span className="input-icon">👤</span>
                            <input 
                                type="text"
                                placeholder="Nombre completo" 
                                value={nombre} 
                                onChange={e => setNombre(e.target.value)}
                            />
                        </div>

                        <div className="input-group">
                            <span className="input-icon">📧</span>
                            <input 
                                type="email"
                                placeholder="Correo electrónico" 
                                value={email} 
                                onChange={e => setEmail(e.target.value)}
                            />
                        </div>

                        <div className="input-group">
                            <span className="input-icon">🔒</span>
                            <input 
                                type="password"
                                placeholder="Contraseña" 
                                value={password} 
                                onChange={e => {
                                    setPassword(e.target.value);
                                    setPasswordStrength(checkPasswordStrength(e.target.value));
                                }}
                            />
                        </div>

                        {password && (
                            <div className="fortaleza-container">
                                <span className="fortaleza-label">Fortaleza:</span>
                                <div className={`fortaleza-barra ${passwordStrength}`}>
                                    <div className="barra-lleno"></div>
                                </div>
                                <span className={`fortaleza-texto ${passwordStrength}`}>{passwordStrength}</span>
                            </div>
                        )}

                        <div className="input-group">
                            <span className="input-icon">🔒</span>
                            <input 
                                type="password"
                                placeholder="Confirmar contraseña" 
                                value={confirmPassword} 
                                onChange={e => setConfirmPassword(e.target.value)}
                            />
                        </div>

                        <button className="btn-primary" onClick={handleRegister}>
                            Registrarse
                        </button>

                        <p className="link-text">
                            ¿Ya tienes cuenta?{' '}
                            <span onClick={() => setIsRegistering(false)}>Inicia sesión</span>
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
}

export default Login;