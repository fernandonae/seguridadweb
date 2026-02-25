const jwt = require('jsonwebtoken');

// [PUNTO 2: FALLOS CRIPTOGRÁFICOS]
// Este middleware verifica que el token sea válido antes de dejar pasar al usuario
const verifyToken = (req, res, next) => {
    // Buscamos el token en el header 'Authorization'
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; // Formato: "Bearer TOKEN"

    if (!token) {
        return res.status(401).json({ 
            mensaje: "Acceso denegado: No se proporcionó un token de seguridad." 
        });
    }

    try {
        // [PUNTO 2: FALLOS CRIPTOGRÁFICOS]
        // Verificamos la firma del token con nuestra clave secreta
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        
        // Guardamos los datos decodificados (id, rol) en el objeto 'req' 
        // para que los siguientes pasos puedan usarlos.
        req.user = decoded; 
        
        next(); // ¡Token válido! Continuamos.
    } catch (error) {
        return res.status(403).json({ mensaje: "Token inválido o expirado." });
    }
};

module.exports = verifyToken;