import multer from "multer";
import path from 'path';
import fs from 'fs';
import { body } from "express-validator";
import { fileURLToPath } from 'url';
import { v4 as uuid } from 'uuid';

import Categorias from "../models/Categorias.js";
import Grupos from "../models/Grupos.js";
import shortid from "shortid";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

/**
 * ! Confuguracion del multer para el cargue de archivos
 * ! usado para cargar la img del perfil
 */
const fileStorage = multer.diskStorage({
    destination: (req,file,next) => {
        next(null, __dirname+'/../public/uploads/grupos/');
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

const formNuevoGrupo = async (req,res) => {
    const categorias = await Categorias.findAll();

    res.render('nuevo-grupo', {
        nombrePagina: 'Crea un nuevo grupo',
        categorias
    });
}

//* Almacena los grupos en la base de datos
const crearGrupo = async (req,res) => {
    const grupo = req.body;

    //! Sanitizar los campos
    const sanetizar = [
        body('nombre').escape(),
        body('url').escape(),
        body('descripcion').escape()
    ]

    await Promise.all(sanetizar.map(val => val.run(req)));

    //* Almacena el usuario autenticado como el crear del grupo
    grupo.usuarioId = req.user.id;
    grupo.categoria = req.body.categoria;

    //* Leer la imagen
    if(req.file) {
        grupo.imagen = req.file.filename;
    }
    
    grupo.id = uuid();

    try {
        //* Almacenar en la bd
        await Grupos.create(grupo);
        req.flash('exito', 'Se ha creado el Grupo Correctamente');
        res.redirect('/administracion');
    } catch (error) {
        console.log('Error crear grupo: ', error);
        //* Extraer el menssage de los errores
        const erroresSequelize = error.errors.map(err => err.message) ?? [];
        
        req.flash('error', erroresSequelize);
        res.redirect('/nuevo-grupo');
    }
}

const formEditarGrupo = async(req,res) => {
    const [grupo, categorias] = await Promise.all([Grupos.findByPk(req.params.grupoId), Categorias.findAll()]);
    
    res.render('editar-grupo', {
        nombrePagina: `Editar Grupo: ${grupo.nombre}`,
        grupo,
        categorias
    })
}

const editarGrupo = async(req,res,next) => {
    const grupo = await Grupos.findOne({where: { 
        id: req.params.grupoId,
        usuarioId: req.user.id
    }})

    //* Si no existe el grupo o no es el dueño
    if(!grupo){
        req.flash('error','Operacion no valida');
        res.redirect('/administracion');
        return next();
    }

    //* Todo bien, leer los valores
    const { nombre,descripcion, categoriaId, url } = req.body;

    //! Sanitizar los campos
    const sanetizar = [
        body('nombre').escape(),
        body('url').escape(),
        body('descripcion').escape()
    ]

    await Promise.all(sanetizar.map(val => val.run(req)));


    //* Asignar los valores
    grupo.nombre = nombre;
    grupo.descripcion = descripcion;
    grupo.categoriaId = categoriaId;
    grupo.url = url;

    //* Guardar en bd
    await grupo.save();
    req.flash('exito', 'Cambios Almacenados Correctamente');
    res.redirect('/administracion');
}

//* Muestra el formulario para editar una imagen de grupo
const formEditarImagen = async(req,res) => {
    const grupo = await Grupos.findByPk(req.params.grupoId);
    
    res.render('imagen-grupo', {
        nombrePagina: `Editar Imagen Grupo: ${grupo.nombre}`,
        grupo
    });
}

const editarImagen = async(req,res,next) => {
    const grupo = await Grupos.findOne({where: { 
        id: req.params.grupoId,
        usuarioId: req.user.id
    }})

    //* Si no existe el grupo o no es el dueño
    if(!grupo){
        req.flash('error','Operacion no valida');
        res.redirect('/administracion');
        return next();
    }

    //* Si hay imagen anterior y nueva, significa que vamos a borra la anterior
    if(req.file && grupo.imagen){
        const imagenAnteriorPath = __dirname + `/../public/uploads/grupos/${grupo.imagen}`;

        //! Eliminar archivo con filesystem
        fs.unlink(imagenAnteriorPath, (error) => {
            if(error){
                console.log(error);
            }
            return;
        })
    }

    //* Si hay una imagen nueva la guardamos
    if(req.file){
        grupo.imagen = req.file.filename;
    }

    //* Guardar en la BD
    await grupo.save();
    req.flash('exito', 'Cambios Alamacenados Correctamente');
    res.redirect('/administracion')
}

//* Eliminar Grupo
const formEliminarGrupo = async(req,res,next) => {
    const grupo = await Grupos.findOne({where: { 
        id: req.params.grupoId,
        usuarioId: req.user.id
    }});

    if(!grupo) {
        req.flash('error', 'Operación no valida');
        res.redirect('/administracion');
        return next();
    }

    //? Todo bien, ejecutar la vista
    res.render('eliminar-grupo', {
        nombrePagina: `Eliminar Grupo: ${grupo.nombre}`
    })
}

const eliminarGrupo = async (req,res,next) => {
    const grupo = await Grupos.findOne({where: { 
        id: req.params.grupoId,
        usuarioId: req.user.id
    }});

    if(!grupo) {
        req.flash('error', 'Operación no valida');
        res.redirect('/administracion');
        return next();
    }

    //* Si hay una imagen la elimina
    if(grupo.imagen){
        const imagenAnteriorPath = __dirname + `/../public/uploads/grupos/${grupo.imagen}`;

        //! Eliminar archivo con filesystem
        fs.unlink(imagenAnteriorPath, (error) => {
            if(error){
                console.log(error);
            }
            return;
        })
    }

    await Grupos.destroy({
        where: {
            id: req.params.grupoId
        }
    });

    //* Redireccionar al usuari
    req.flash('exito','Grupo Eliminado');
    res.redirect('/administracion');
}

export{
    formNuevoGrupo,
    crearGrupo,
    subirImagen,
    formEditarGrupo,
    editarGrupo,
    formEditarImagen,
    editarImagen,
    formEliminarGrupo,
    eliminarGrupo

}