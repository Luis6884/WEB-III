const express = require('express');
const cors = require('cors');
const mysql = require('mysql2');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const svgCaptcha = require('svg-captcha');

const app = express();
app.use(cors());
app.use(express.json());

const db = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'electroshop'
});

db.connect((err) => {
    if (err) {
        console.error(' Error conectando a MySQL:', err);
        return;
    }
    console.log(' Conectado a MySQL (electroshop)');
});

//  ALMACENAMIENTO DE CAPTCHAS
const captchaStore = new Map();

setInterval(() => {
    const now = Date.now();
    for (const [key, value] of captchaStore.entries()) {
        if (now - value.timestamp > 300000) {
            captchaStore.delete(key);
        }
    }
}, 300000);

// 1
app.get('/api/captcha', (req, res) => {
    const captcha = svgCaptcha.create({
        size: 6,
        ignoreChars: '0o1i',
        noise: 2,
        color: true,
        background: '#f8f9fa',
        width: 150,
        height: 50
    });
    
    const captchaId = Math.random().toString(36).substring(2, 15);
    captchaStore.set(captchaId, {
        text: captcha.text.toLowerCase(),
        timestamp: Date.now()
    });
    
    res.json({
        captchaId: captchaId,
        svg: captcha.data
    });
});

function verificarCaptcha(captchaId, userInput) {
    const stored = captchaStore.get(captchaId);
    if (!stored) return false;
    const isValid = stored.text === userInput.toLowerCase();
    captchaStore.delete(captchaId);
    return isValid;
}
// 2
function verificarToken(req, res, next) {
    const token = req.headers['authorization'];
    if (!token) {
        return res.status(401).json({ error: 'Token requerido' });
    }
    
    jwt.verify(token, 'clave_secreta_123', (err, decoded) => {
        if (err) {
            return res.status(401).json({ error: 'Token inválido' });
        }
        req.usuarioId = decoded.id;
        req.usuarioEmail = decoded.email;
        req.usuarioRol = decoded.rol;
        req.usuarioNombre = decoded.nombre;
        next();
    });
}

//  3
app.post('/api/registro', async (req, res) => {
    const { nombre, email, password } = req.body;
    
    // Validación de campos
    if (!nombre || !email || !password) {
        return res.status(400).json({ error: 'Todos los campos son obligatorios' });
    }

    let fortaleza = 'débil';
    if (password.length >= 6) {
        let tieneMayuscula = /[A-Z]/.test(password);
        let tieneNumero = /[0-9]/.test(password);
        let tieneEspecial = /[^A-Za-z0-9]/.test(password);
        
        if (tieneMayuscula && tieneNumero && tieneEspecial) {
            fortaleza = 'fuerte';
        } else if ((tieneMayuscula && tieneNumero) || (tieneMayuscula && tieneEspecial) || (tieneNumero && tieneEspecial)) {
            fortaleza = 'media';
        }
    }
        db.query('SELECT * FROM usuarios WHERE email = ?', [email], async (err, results) => {
        if (err) return res.status(500).json({ error: 'Error en BD' });
        if (results.length > 0) {
            return res.status(400).json({ error: 'El email ya está registrado' });
        }
                const hashedPassword = await bcrypt.hash(password, 10);
        const rol = 'cliente';
        
        db.query('INSERT INTO usuarios (nombre, email, password, rol) VALUES (?, ?, ?, ?)', 
            [nombre, email, hashedPassword, rol], 
            (err, result) => {
                if (err) return res.status(500).json({ error: 'Error al registrar' });
                res.json({ mensaje: ' Usuario registrado exitosamente', fortaleza, rol });
            });
    });
});

// 4

app.post('/api/login', (req, res) => {
    const { email, password, captchaId, captchaText } = req.body;
    
    if (!captchaId || !captchaText) {
        return res.status(400).json({ error: ' CAPTCHA requerido' });
    }
    
    const captchaValido = verificarCaptcha(captchaId, captchaText);
    if (!captchaValido) {
        return res.status(400).json({ error: ' CAPTCHA incorrecto' });
    }
    
    db.query('SELECT * FROM usuarios WHERE email = ?', [email], async (err, results) => {
        if (err) return res.status(500).json({ error: 'Error en BD' });
        if (results.length === 0) {
            return res.status(401).json({ error: 'Usuario no encontrado' });
        }
        
        const usuario = results[0];

        const valido = await bcrypt.compare(password, usuario.password);
        if (!valido) {
            return res.status(401).json({ error: 'Contraseña incorrecta' });
        }
        
        const token = jwt.sign(
            { id: usuario.id, nombre: usuario.nombre, email: usuario.email, rol: usuario.rol },
            'clave_secreta_123',
            { expiresIn: '24h' }
        );
        
        const ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress;
        const browser = req.headers['user-agent'];
        
        db.query(
            'INSERT INTO logs_acceso (usuario_id, nombre, email, ip, evento, browser) VALUES (?, ?, ?, ?, ?, ?)',
            [usuario.id, usuario.nombre, usuario.email, ip, 'login', browser],
            (errLog) => {
                if (errLog) console.error('Error al guardar log:', errLog);
            }
        );
        
        res.json({
            token,
            usuario: {
                id: usuario.id,
                nombre: usuario.nombre,
                email: usuario.email,
                rol: usuario.rol
            }
        });
    });
});

// 5

app.post('/api/logout', verificarToken, (req, res) => {
    const ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress;
    const browser = req.headers['user-agent'];
    
    db.query(
        'INSERT INTO logs_acceso (usuario_id, nombre, email, ip, evento, browser) VALUES (?, ?, ?, ?, ?, ?)',
        [req.usuarioId, req.usuarioNombre, req.usuarioEmail, ip, 'logout', browser],
        (errLog) => {
            if (errLog) console.error('Error al guardar log:', errLog);
        }
    );
    
    res.json({ mensaje: 'Sesión cerrada' });
});

// 6

app.get('/api/productos', verificarToken, (req, res) => {
    db.query('SELECT * FROM productos WHERE activo = 1 ORDER BY id DESC', (err, results) => {
        if (err) return res.status(500).json({ error: 'Error en BD' });
        res.json(results);
    });
});

app.post('/api/productos', verificarToken, (req, res) => {
    if (req.usuarioRol !== 'admin') {
        return res.status(403).json({ error: 'No tienes permisos' });
    }
    
    const { nombre, categoria, precio, stock, icono, imagen_url } = req.body;
    db.query('INSERT INTO productos (nombre, categoria, precio, stock, icono, imagen_url) VALUES (?, ?, ?, ?, ?, ?)',
        [nombre, categoria, precio, stock || 0, icono || '📦', imagen_url || ''],
        (err, result) => {
            if (err) return res.status(500).json({ error: 'Error al crear' });
            res.json({ id: result.insertId, mensaje: 'Producto creado' });
        });
});

app.put('/api/productos/:id', verificarToken, (req, res) => {
    const { nombre, categoria, precio, stock, icono, imagen_url } = req.body;
    db.query('UPDATE productos SET nombre=?, categoria=?, precio=?, stock=?, icono=?, imagen_url=? WHERE id=?',
        [nombre, categoria, precio, stock, icono, imagen_url, req.params.id],
        (err) => {
            if (err) return res.status(500).json({ error: 'Error al actualizar' });
            res.json({ mensaje: 'Producto actualizado' });
        });
});

app.delete('/api/productos/:id', verificarToken, (req, res) => {
    if (req.usuarioRol !== 'admin') {
        return res.status(403).json({ error: 'No tienes permisos' });
    }
    db.query('UPDATE productos SET activo = 0 WHERE id = ?', [req.params.id], (err) => {
        if (err) return res.status(500).json({ error: 'Error al eliminar' });
        res.json({ mensaje: 'Producto eliminado (eliminación lógica)' });
    });
});

// 7

app.post('/api/compras', verificarToken, (req, res) => {
    const { total, metodoPago, productos } = req.body;
    const productosJSON = JSON.stringify(productos);
    
    db.query('INSERT INTO compras (usuario_id, usuario_nombre, usuario_email, total, metodo_pago, productos) VALUES (?, ?, ?, ?, ?, ?)',
        [req.usuarioId, req.usuarioNombre, req.usuarioEmail, total, metodoPago, productosJSON],
        (err, result) => {
            if (err) return res.status(500).json({ error: 'Error al guardar compra' });
            res.json({ id: result.insertId, mensaje: 'Compra guardada' });
        });
});

app.get('/api/compras/mis-compras', verificarToken, (req, res) => {
    db.query('SELECT * FROM compras WHERE usuario_id = ? ORDER BY fecha DESC',
        [req.usuarioId], (err, results) => {
            if (err) return res.status(500).json({ error: 'Error en BD' });
            res.json(results);
        });
});

//  8

app.get('/api/estadisticas', verificarToken, (req, res) => {
    db.query('SELECT categoria, COUNT(*) as cantidad, SUM(stock) as total_stock FROM productos WHERE activo = 1 GROUP BY categoria',
        (err, results) => {
            if (err) return res.status(500).json({ error: 'Error en BD' });
            res.json(results);
        });
});

//  9

app.get('/api/logs', verificarToken, (req, res) => {
    if (req.usuarioRol !== 'admin') {
        return res.status(403).json({ error: 'No tienes permisos' });
    }
    db.query('SELECT id, nombre, email, ip, evento, fecha_hora FROM logs_acceso ORDER BY fecha_hora DESC LIMIT 100', (err, results) => {
        if (err) {
            console.error('Error al obtener logs:', err);
            return res.status(500).json({ error: 'Error en BD' });
        }
        res.json(results);
    });
});

const PORT = 3000;
app.listen(PORT, () => {
    console.log(` Servidor corriendo en http://localhost:${PORT}`);
});