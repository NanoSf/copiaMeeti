import express from 'express';
import expressLayouts from 'express-ejs-layouts';
import path from 'path';
import dotenv from 'dotenv';
import bodyParser from 'body-parser';
import router from './routes/index.js';
import flash from 'connect-flash';
import session from 'express-session';
import cookieParser from 'cookie-parser';
import { fileURLToPath } from 'url';

//* Import locales
import db from './config/db.js';
import Usuarios from './models/Usuarios.js';
import Categorias from './models/Categorias.js';
import Grupos from './models/Grupos.js';
import Meeti from './models/Meeti.js';
import Comentario from './models/Comentarios.js';
import passport from './config/passport.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);


dotenv.config({path: 'variables.env'});

db.sync().then( () => console.log('DB Conectada') ).catch( (error) => console.log(error) );

//* Aplicacion principal
const app = express();

//* Body parser, leer formularios
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));

//* Habilitar EJS como template engine
app.use(expressLayouts);
app.set('view engine', 'ejs');

//* Ubicación de las vistas
app.set('views', path.join(__dirname, './views'))

//* Archivos staticos
app.use(express.static('public'))

//* Habilitar cookie parser
app.use(cookieParser());

//*  Crear la session
app.use(session({
    secret: process.env.SECRETO,
    key: process.env.KEY,
    resave: false,
    saveUninitialized: false
}));

//* Iniciar Passport
app.use(passport.initialize());
app.use(passport.session());

//* Agrega flash Messages
app.use(flash());

//* Middeleware (usuario, logueado, flash, message, fecha actual)
app.use( (req,res,next) => {
    res.locals.usuario = {...req.user} || null;
    res.locals.mensajes = req.flash();
    const fecha = new Date();
    res.locals.year = fecha.getFullYear();
    
    next();
} );

//* Routing
app.use('/', router);

//* Agrega el puerto
app.listen(process.env.PORT, () => {
    console.log('El servidor esta funcionando');
});