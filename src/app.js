require('dotenv').config();
const express = require('express');
const path = require('path');
const cors = require('cors');
const helmet = require('helmet'); // [NUEVO]
const rateLimit = require('express-rate-limit'); // [NUEVO]
const conectarDB = require('./config/db');
const authRoutes = require('./routes/authRoutes');

const app = express();

// 1. CONEXIÓN A DB
conectarDB();

// --- CONFIGURACIONES DE SEGURIDAD ---

// [PUNTO 3: DISEÑO INSEGURO] 
// Helmet protege tu app de ataques web comunes (XSS, Clickjacking) configurando cabeceras HTTP.
// [PUNTO 3: DISEÑO INSEGURO]
// Configuramos Helmet pero relajamos la CSP para permitir los eventos de los botones (onclick)
app.use(helmet({
    contentSecurityPolicy: {
        directives: {
            "default-src": ["'self'"],
            "script-src": ["'self'", "'unsafe-inline'"], // Permite scripts internos
            "script-src-attr": ["'unsafe-inline'"],    // ¡ESTO ARREGLA TUS BOTONES!
            "style-src": ["'self'", "'unsafe-inline'"],  // Permite tus estilos CSS
        },
    },
}));

// [PUNTO 3: DISEÑO INSEGURO]
// Rate Limiting: Evita ataques de fuerza bruta (que alguien intente mil contraseñas por segundo).
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutos
    max: 100, // Máximo 100 peticiones por IP
    message: 'Demasiados intentos desde esta IP, intente más tarde.'
});
app.use('/api/', limiter); 

app.use(cors());
app.use(express.json());

// --- LÓGICA DE RUTA PARA LA CARPETA PUBLIC ---
const publicPath = __dirname.endsWith('src') 
    ? path.join(__dirname, '..', 'public') 
    : path.join(__dirname, 'public');

app.use(express.static(publicPath));

// [PUNTO 1: BROKEN ACCESS CONTROL]
// Las rutas están agrupadas. El control real se hará dentro de 'authRoutes'
app.use('/api/auth', authRoutes);

// Si alguien entra a la raíz, enviamos el index.html
app.get('/', (req, res) => {
    res.sendFile(path.join(publicPath, 'index.html'));
});

// [PUNTO 3: DISEÑO INSEGURO]
// Manejo de errores centralizado: No muestra detalles técnicos (stacktrace) al usuario, 
// lo que evita que un atacante conozca tu estructura.
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).send({ error: 'Error interno del servidor' });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`✅ Servidor Protegido en: http://localhost:${PORT}`);
});

// Esto permite que tu HTML hable con el servidor