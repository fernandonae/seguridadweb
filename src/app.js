require('dotenv').config();
const express = require('express');
const path = require('path');
const cors = require('cors');
const helmet = require('helmet'); 
const rateLimit = require('express-rate-limit'); 
const conectarDB = require('./config/db');
const authRoutes = require('./routes/authRoutes');

const app = express();

// 1. CONEXIÓN A DB
conectarDB();

// --- CONFIGURACIONES DE SEGURIDAD ---

// [PUNTO 3: DISEÑO INSEGURO]
app.use(helmet({
    contentSecurityPolicy: {
        directives: {
            "default-src": ["'self'"],
            "script-src": ["'self'", "'unsafe-inline'", "https://cdn.jsdelivr.net"], // Permitimos CDN si usas Bootstrap/SweetAlert
            "script-src-attr": ["'unsafe-inline'"],
            "style-src": ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
            "connect-src": ["'self'", "*"] // IMPORTANTE: Permite que el HTML se conecte a cualquier API (Render)
        },
    },
}));

// [PUNTO 3: DISEÑO INSEGURO] - Rate Limiting
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, 
    max: 100, 
    message: 'Demasiados intentos desde esta IP, intente más tarde.'
});
app.use('/api/', limiter); 

// CONFIGURACIÓN DE CORS: Permite que tu frontend hable con el backend
app.use(cors());
app.use(express.json());

// --- LÓGICA PARA CARPETA PUBLIC ---
// Ajuste para que funcione tanto en local como en Render
const publicPath = path.join(__dirname, '..', 'public');
app.use(express.static(publicPath));

// RUTAS
app.use('/api/auth', authRoutes);

// Servir el index.html en la raíz
app.get('/', (req, res) => {
    res.sendFile(path.join(publicPath, 'index.html'));
});

// Manejo de errores
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).send({ error: 'Error interno del servidor' });
});

// CONFIGURACIÓN DE PUERTO PARA RENDER
const PORT = process.env.PORT || 3000;
// Usamos '0.0.0.0' para que Render pueda exponer el servicio a internet
app.listen(PORT, '0.0.0.0', () => {
    console.log(`✅ Servidor Protegido y Online en puerto: ${PORT}`);
});