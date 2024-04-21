import Usuarios from '../models/Usuarios.js';
import { body, validationResult } from 'express-validator';
import enviarEmail from '../handlers/emails.js';
import multer from "multer";
import { fileURLToPath } from 'url';
import shortid from "shortid";
import path from 'path';
import fs from 'fs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
/**
 * ! Confuguracion del multer para el cargue de archivos
 * ! usado para cargar la img del perfil
 */
const fileStorage = multer.diskStorage({
    destination: (req,file,next) => {
        next(null, __dirname+'/../public/uploads/perfiles/');
    },
    filename: (req,file,next) => {
        const extension = file.mimetype.split('/')[1];
        next(null, `${shortid.generate()}.${extension}`);
    }
});

const configuracionMulter = {
    limits: {fileSize: 100000},
    storage: fileStorage,
    fileFilter(req,file,next){
        if (file.mimetype === 'image/jpeg' || file.mimetype === 'image/png') {
            //* El formato es valido
            next(null,true);
        }else{
            //* El formato no es valido
            next(new Error('Formato no válido'), false)
        }
    }
}

const upload = multer(configuracionMulter).single('imagen');

//* subir imagen el el servido
const subirImagen = (req,res,next) => {
    upload(req,res, function(error){
        if(error){
            console.log('Error al subir Imagen ===== ', error);

            if(error instanceof multer.MulterError){
                if(error.code === 'LIMIT_FILE_SIZE'){
                    req.flash('error', 'El archivo es muy grande');
                }else{
                    req.flash('error', error.message);
                }
            }else if(error.hasOwnProperty('message')){
                req.flash('error', error.message);
            }
            
            res.redirect('back');
            return;
        }else{
            next();
        }
    });
}

const formCrearCuenta = (req,res) => {
    res.render('crear-cuenta', {
        nombrePagina: 'Crea tu Cuenta'
    });
}

const crearNuevaCuenta = async (req,res) => {
    const usuario = req.body;
    
    const validaciones = [
        body('confirmar').notEmpty().withMessage('El password confirmado no puede ir vacio'),
        body('confirmar').equals(req.body.password).withMessage('Las contraseñas no coinciden')
    ]

    await Promise.all(validaciones.map(val => val.run(req)));

    //* Leer los errores de express
    const erroresExpress = validationResult(req).errors;
    
    try {
        await Usuarios.create(usuario);

        //* Url de confirmacion
        const url = `http://${req.headers.host}/confirmar-cuenta/${usuario.email}`

        //* Enviar email de confirmacion
        await enviarEmail({
            usuario,
            url,
            subject: 'Confirma tu cuenta de Meeti',
            archivo: 'confirmar-cuenta'
        });

        //TODO: Flash Message y redireccion
        req.flash('exito', 'Hemos enviado un email, confirma tu cuenta');
        return res.redirect('/iniciar-sesion');

    } catch (error) {
        console.log('ERRORES:::::: ', error);
        //* Eliminar el usuario
        await Usuarios.destroy({where: {
            nombre: req.body.nombre,
            email: req.body.email
        }});

        //* Extraer el message de los errores
        const erroresSequelize = error?.errors?.map(err => err.message) || [];

        //* Extrar unicamente el msg de los errores de expres
        const errExp = erroresExpress.map(err => err.msg);
        
        //* Unir los errores
        const listaErrores = [...erroresSequelize, ...errExp];

        req.flash('error', listaErrores);
        res.redirect('/crear-cuenta');
    }
    
}

//* Confirmar la suscripcion del usuario
const confirmarCuenta = async (req,res,next) => {
    //* Verificar que el usuario exista
    const usuario = await Usuarios.findOne({
        where: {
            email : req.params.correo
        }
    });

    //* Sino existe, redireccionar
    if (!usuario) {
        req.flash('error', 'No existe esta cuenta');
        res.redirect('/crear-cuenta');
        return next();
    }

    //* Si existe, confirmar suscripcion y redireccionar
    usuario.activo = 1;
    await usuario.save();

    req.flash('exito', 'La cuenta ya se ha confirmado, ya puedes iniciar sesión');
    res.redirect('/iniciar-sesion');
}


//* Formulario para iniciar sesion
const formIniciarSesion = (req,res,next) => {
    return res.render('iniciar-sesion', {
        nombrePagina: 'Iniciar Sesion'
    })
}

//* Musetra formulario editar perfil
const formEditarPerfil = async (req,res) => {
    const usuario = await Usuarios.findByPk(req.user.id);

    res.render('editar-perfil', {
        nombrePagina: 'Editar Perfil',
        usuario
    })
}

//* Cerrar sesion
const cerrarSesion = (req,res,next) => {
    req.logout((error) => {
        if(error){
            req.flash('error', error);
            return res.redirect('/administracion');
        }
    });
    req.flash('error', 'Cerraste sesion correctamente');
    res.redirect('/iniciar-sesion');
    next();
}

//* Almacena en la base de datos los cambios al perfil
const editarPerfil = async (req,res,next) => {
    const usuario = await Usuarios.findByPk(req.user.id);

    //* leer datos del form
    const { nombre,descripcion,email } = req.body;

    //* Asignar valores
    usuario.nombre = nombre;
    usuario.descripcion = descripcion;
    usuario.email = email;

    //* Guardar en BD
    try {
        await usuario.save();
        req.flash('exito', 'Cambios guardados correctamente');
        res.redirect('/administracion');
    } catch (error) {
        console.log(error);

        //* Extraer el menssage de los errores
        const erroresSequelize = error.errors.map(err => err.message) ?? [];

        req.flash('error', erroresSequelize);
        res.redirect('/nuevo-meeti')
    }
}

const sanitizarUsuario = async (req, res, next) => {
    //! Sanitizar los campos
    const campos = [
        body('nombre').escape(),
        body('descripcion').escape(),
        body('email').escape(),
    ]

    await Promise.all(campos.map(val => val.run(req)));

    next();
}

//* Muestra el formulario para modificar el password
const formCambiarPassword = (req,res) => {
    res.render('cambiar-password', {
        nombrePagina: 'Cambiar Password'
    })
}

//* Revisa si el password anterior es correcto y lo modifica por uno nuevo
const cambiarPassword = async (req,res,next) => {
    const usuario = await Usuarios.findByPk(req.user.id);

    //* Verificar que el password anterior sea correcto
    if(!usuario.validarPassword(req.body.anterior)){
        req.flash('error', 'El password actual es incorrecto');
        return res.redirect('/administracion');
    }

    //* Si el password es correcto, hashear el nuevo
    const hash = usuario.hashPassword(req.body.nuevo);

    //* Asignar el password al usuario
    usuario.password = hash;

    //* Guardar en bases de datos
    try {
        await usuario.save();
        req.logout( (error) => {
            
            if (error) { 
                req.flash('error', error);
                return res.redirect('/cambiar-password')
            }

            req.flash('exito', 'Password Modificado correctamente, vuelve a iniciar sesión');
            return res.redirect('/iniciar-sesion');
        });
        
    } catch (error) {
        console.log(error);
        //* Extraer el menssage de los errores
        const erroresSequelize = error.errors.map(err => err.message) ?? [];

        req.flash('error', erroresSequelize);
        res.redirect('/nuevo-meeti')
    }

    //* Redireccionar
}

//* Mostar pantalla subir imagen
const formSubirImagenPerfil = async (req,res) => {
    const usuario = await Usuarios.findByPk(req.user.id);
    
    res.render('imagen-perfil', {
        nombrePagina: 'Subir Imagen Perfil',
        usuario
    });
}


//* Guarda la imagen nueva, elimina la anterior(si aplica) y guarda el registro en bd
const guardarImagenPerfil = async (req,res,next) => {
    const usuario = await Usuarios.findByPk(req.user.id);

    //* Si hay imagen anterior eliminarla
    if(req.file && usuario.imagen){
        const imagenAnteriorPath = __dirname + `/../public/uploads/perfiles/${usuario.imagen}`;

        //! Eliminar archivo con filesystem
        fs.unlink(imagenAnteriorPath, (error) => {
            if(error){
                console.log(error);
            }
            return;
        })
    }

    //* Almacenar la nueva imagen
    if(req.file){
        usuario.imagen = req.file.filename;
    }

    //* Almacenar en la base de datos y redireccionar
    await usuario.save();
    req.flash('exito', 'Cambios Alamacenados Correctamente');
    res.redirect('/administracion')
}


export{
    formCrearCuenta,
    crearNuevaCuenta,
    formIniciarSesion,
    confirmarCuenta,
    cerrarSesion,
    formEditarPerfil,
    editarPerfil,
    sanitizarUsuario,
    formCambiarPassword,
    cambiarPassword,
    formSubirImagenPerfil,
    guardarImagenPerfil,
    subirImagen
}