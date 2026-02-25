const jwt = require('jsonwebtoken'); // [PUNTO 2: Criptografía]

/**
 * MIDDLEWARE: Control de Acceso Basado en Roles (RBAC) Mejorado
 */
const checkRole = (rolesPermitidos) => {
    return (req, res, next) => {
        // [PUNTO 1 & 3: DISEÑO SEGURO] 
        // Ya no leemos el rol del Header directamente. 
        // Lo leemos del Token que enviará el usuario en 'Authorization'.
        const authHeader = req.headers['authorization'];
        const token = authHeader && authHeader.split(' ')[1]; // Formato: "Bearer TOKEN"

        if (!token) {
            return res.status(401).json({ 
                mensaje: "Acceso denegado: No se encontró un Token de seguridad." 
            });
        }

        try {
            // [PUNTO 2: FALLOS CRIPTOGRÁFICOS]
            // Verificamos que el token sea auténtico usando tu CLAVE_SECRETA
            // Si el token fue alterado, aquí saltará un error.
            const decoded = jwt.verify(token, process.env.JWT_SECRET || 'clave_maestra_provisoria');
            
            // Guardamos los datos del usuario en la petición para que el controlador los use
            req.user = decoded; 

            // [PUNTO 1: BROKEN ACCESS CONTROL]
            // Ahora comparamos el ROL REAL que viene dentro del token verificado.
            if (rolesPermitidos.includes(req.user.role)) {
                next(); // ¡Acceso legítimo!
            } else {
                res.status(403).json({ 
                    mensaje: `Error de Permisos: Tu rol [${req.user.role}] no tiene autorización.` 
                });
            }

        } catch (error) {
            // Si el token expiró o es falso
            return res.status(403).json({ mensaje: "Token inválido o expirado." });
        }
    };
};

module.exports = checkRole;