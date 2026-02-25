const mongoose = require('mongoose');

/**
 * Función asíncrona para establecer la conexión con MongoDB Atlas.
 * Se usa 'async/await' para esperar la respuesta del servidor remoto 
 * antes de continuar con la ejecución del programa.
 */
const conectarDB = async () => {
    try {
        // Establece la conexión utilizando la URI almacenada en el archivo .env por seguridad.
        // No hardcodeamos la contraseña aquí para evitar fugas de información.
        await mongoose.connect(process.env.MONGO_URI);
        
        console.log('🚀 Conectado a MongoDB Atlas');
    } catch (error) {
        // Si hay un error (ej. contraseña incorrecta o falta de internet), lo atrapa aquí.
        console.error('❌ Error al conectar a la DB:', error);
        
        // Detiene la ejecución de la aplicación inmediatamente si no hay base de datos.
        // El código '1' indica que el proceso terminó debido a un fallo.
        process.exit(1);
    }
};

// Exportamos la función para que pueda ser ejecutada en app.js al arrancar el servidor.
module.exports = conectarDB;