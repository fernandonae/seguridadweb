const mongoose = require('mongoose');

/**
 * Definición del Esquema de Usuario (Schema)
 * Este objeto define la estructura y las restricciones de seguridad
 * para los documentos en la colección 'users' de MongoDB.
 */
const UserSchema = new mongoose.Schema({
    // El nombre de usuario es obligatorio y no puede repetirse en la base de datos (unique).
    // Esto evita la suplantación de identidad o duplicidad de cuentas.
    username: { 
        type: String, 
        required: true, 
        unique: true 
    },

    // La contraseña es obligatoria. 
    // Nota: Aunque aquí se define como String, el controlador se encarga de que
    // lo que se guarde sea un Hash (encriptado) y no texto plano.
    password: { 
        type: String, 
        required: true 
    },

    // CONTROL DE ACCESO (RBAC):
    // Definimos un set cerrado de roles permitidos mediante 'enum'.
    // Si alguien intenta registrar un rol que no sea estos tres, la BD lo rechazará.
    role: { 
        type: String, 
        enum: ['admin', 'user', 'editor'], 
        default: 'user' // Por seguridad, si no se especifica, el nivel de acceso es el más bajo.
    }
});

// Exportamos el modelo para poder realizar operaciones CRUD (Crear, Leer, Actualizar, Borrar)
module.exports = mongoose.model('User', UserSchema);