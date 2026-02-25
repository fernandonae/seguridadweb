const User = require('../models/user');
const crypto = require('crypto');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const generarClaveSegura = (longitud = 12) => {
    return crypto.randomBytes(longitud).toString('hex').slice(0, longitud);
};

// 2. CONTROLADOR PARA REGISTRO
exports.registrarUsuario = async (req, res) => {
    try {
        const { username, role } = req.body;
        
        // [NUEVA LÓGICA DE SEGURIDAD]
        // Obtenemos el token de quien hace la petición para saber si es Admin
        const authHeader = req.headers['authorization'];
        const token = authHeader && authHeader.split(' ')[1];
        
        let esAdminHaciendoLaPeticion = false;

        if (token) {
            try {
                const decoded = jwt.verify(token, process.env.JWT_SECRET || 'clave_secreta_emergencia');
                if (decoded.role === 'admin') esAdminHaciendoLaPeticion = true;
            } catch (err) {
                // Token inválido, no pasa nada, se queda como false
            }
        }

        // [PUNTO 3: DISEÑO INSEGURO / BROKEN ACCESS CONTROL]
        // Si alguien intenta crear un 'admin' y NO es un admin logueado, lo bloqueamos.
        if (role === 'admin' && !esAdminHaciendoLaPeticion) {
            return res.status(403).json({ 
                mensaje: "Seguridad: Solo un Administrador puede crear otras cuentas de administrador." 
            });
        }

        // Si pasó la validación, respetamos el rol que pidió, de lo contrario es 'user'
        const rolFinal = role || 'user';

        const passwordPlana = generarClaveSegura();
        const salt = await bcrypt.genSalt(12);
        const hashedPassword = await bcrypt.hash(passwordPlana, salt);

        const nuevoUsuario = new User({
            username,
            password: hashedPassword,
            role: rolFinal
        });

        await nuevoUsuario.save();

        res.status(201).json({
            mensaje: "Usuario registrado con éxito",
            passwordGenerated: passwordPlana,
            datos: { usuario: username, rolAsignado: nuevoUsuario.role }
        });
    } catch (error) {
        res.status(500).json({ mensaje: "Error al registrar", error: error.message });
    }
};

// 3. CONTROLADOR PARA LOGIN (Se queda igual, está bien)
exports.login = async (req, res) => {
    try {
        const { username, password } = req.body;
        const usuario = await User.findOne({ username });
        
        if (!usuario) return res.status(401).json({ mensaje: "Credenciales inválidas" });

        const esValida = await bcrypt.compare(password, usuario.password);
        if (!esValida) return res.status(401).json({ mensaje: "Credenciales inválidas" });

        const token = jwt.sign(
            { id: usuario._id, role: usuario.role },
            process.env.JWT_SECRET || 'clave_secreta_emergencia',
            { expiresIn: '1h' }
        );

        res.json({ 
            mensaje: "Login exitoso", 
            token, 
            rol: usuario.role 
        });
    } catch (error) {
        res.status(500).json({ mensaje: "Error en el login" });
    }
};

// 4, 5 y 6 (Obtener, Actualizar y Eliminar se quedan como los tenías, están correctos)
exports.obtenerUsuarios = async (req, res) => {
    try {
        const usuarios = await User.find({}, '-password -__v'); 
        res.json(usuarios);
    } catch (error) {
        res.status(500).json({ mensaje: "Error al obtener lista" });
    }
};

exports.actualizarUsuario = async (req, res) => {
    try {
        const { id } = req.params;
        const { role } = req.body;
        const rolesValidos = ['admin', 'editor', 'user'];
        if (!rolesValidos.includes(role)) return res.status(400).json({ mensaje: "Rol no válido" });

        const usuarioActualizado = await User.findByIdAndUpdate(id, { role }, { new: true });
        res.json({ mensaje: "Rol actualizado", usuario: usuarioActualizado.username });
    } catch (error) {
        res.status(500).json({ mensaje: "Error al actualizar" });
    }
};

exports.eliminarUsuario = async (req, res) => {
    try {
        const { id } = req.params;
        if (id === req.user.id) {
            return res.status(400).json({ mensaje: "No puedes borrar tu propia cuenta de administrador" });
        }
        await User.findByIdAndDelete(id);
        res.json({ mensaje: "Usuario eliminado exitosamente" });
    } catch (error) {
        res.status(500).json({ mensaje: "Error al eliminar" });
    }
};