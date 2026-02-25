import jwt from 'jsonwebtoken';
import { TOKEN_SECRET } from '../config.js';

export function createAccessToken(payload) {
    return new Promise((resolve, reject) => {
        jwt.sign(
            payload,
            TOKEN_SECRET,
            {
                // [PUNTO 3: DISEÑO INSEGURO] 
                // Reducimos el tiempo a 2h o 4h. 
                // Un token de 1 día es riesgoso si alguien lo roba (Broken Access Control).
                expiresIn: "4h", 
                
                // [PUNTO 2: FALLOS CRIPTOGRÁFICOS]
                // Especificamos explícitamente el algoritmo para evitar ataques de "None Algorithm"
                algorithm: 'HS256' 
            },
            (err, token) => {
                if (err) {
                    // [DISEÑO SEGURO] No enviamos el error técnico 'err' directamente al cliente
                    reject(new Error("Error al generar el pase de seguridad"));
                }
                resolve(token);
            }
        );
    });
}