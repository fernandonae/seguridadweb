const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const checkRole = require('../middlewares/roleAuth');
const verifyToken = require('../middlewares/authMiddlewares'); // [IMPORTANTE] Asegúrate de tener este archivo

// --- C R E A T E (POST) ---
// Registro y Login son públicos por naturaleza.
router.post('/register', authController.registrarUsuario);
router.post('/login', authController.login);

// ==========================================================
// APLICACIÓN DE PUNTOS DE LA PROFA:
// ==========================================================

// --- R E A D (GET) ---
// [PUNTO 1: BROKEN ACCESS CONTROL] 
// Antes cualquiera podía ver la lista. Ahora solo un Admin autenticado puede.
router.get('/users', verifyToken, checkRole(['admin']), authController.obtenerUsuarios);

// --- U P D A T E (PUT) ---
// [PUNTO 3: DISEÑO INSEGURO] 
// No permitas que un usuario cambie su propio rol o el de otros sin ser admin.
router.put('/user/:id', verifyToken, checkRole(['admin']), authController.actualizarUsuario);

// --- D E L E T E (DELETE) ---
// [PUNTO 1: BROKEN ACCESS CONTROL]
// Evitamos que un atacante borre la base de datos de usuarios.
router.delete('/user/:id', verifyToken, checkRole(['admin']), authController.eliminarUsuario);

// --- ZONAS PROTEGIDAS ---
// [PUNTO 2: FALLOS CRIPTOGRÁFICOS]
// Al usar 'verifyToken', nos aseguramos de que el JWT (criptografía) sea válido.
router.get('/admin-only', verifyToken, checkRole(['admin']), (req, res) => {
    res.json({ mensaje: "Bienvenido, Administrador. Acceso seguro garantizado." });
});

router.get('/editor-zone', verifyToken, checkRole(['admin', 'editor']), (req, res) => {
    res.json({ mensaje: "Bienvenido. Tienes permisos para editar contenido." });
});

module.exports = router;