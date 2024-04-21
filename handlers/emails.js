import nodemailer from 'nodemailer';
import fs from 'fs';
import util from 'util';
import ejs from 'ejs';
import path from 'path';
import { fileURLToPath } from 'url';
import { log } from 'console';

//! Import Locales
import emailConfig from '../config/emails.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

let transport = nodemailer.createTransport({
    host: emailConfig.host,
    port: emailConfig.port,
    tls: {
        rejectUnauthorized: false
    },
    auth: {
        user: emailConfig.user,
        pass: emailConfig.pass
    }
});

//* Enviar Emails
const enviarEmail = async ( opciones ) => {
    console.log(opciones);

    //* Leer el archivo para el mail
    const archivo = __dirname + `/../views/emails/${opciones.archivo}.ejs`;

    //* Compilarlo
    const compilado = ejs.compile(fs.readFileSync(archivo, 'utf8'));
    
    //* Crear el HTML
    const html = compilado({url: opciones.url});

    //* Configurar las opciones del email
    const opcionesEmail = {
        from: 'Meeti <noreply@meeti.com>',
        to: opciones.usuario.email,
        subject: opciones.subject,
        html
    }

    //* Enviar el mail
    const sendMail = util.promisify(transport.sendMail, transport);

    return sendMail.call(transport, opcionesEmail);

}


export default enviarEmail;
