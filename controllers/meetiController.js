import Grupos from "../models/Grupos.js";
import Meeti from "../models/Meeti.js";
import { body } from "express-validator";
import { v4 as uuid } from 'uuid';

const formNuevoMeeti = async (req, res) => {
    const grupos = await Grupos.findAll({
        where: { usuarioId: req.user.id }
    })
    res.render('nuevo-meeti', {
        nombrePagina: 'Crear Nuevo Meeti',
        grupos
    });
}

const crearMeeti = async (req, res) => {
    //* Obtener los datos
    const meeti = req.body;

    //* Asignar el usuario
    meeti.usuarioId = req.user.id;

    //* Almacenar la ubicacion con point
    const point = {
        type: 'Point',
        coordinates: [parseFloat(meeti.lat), parseFloat(meeti.lng)]
    };

    meeti.ubicacion = point;

    //* Cupo opcional
    if (req.body.cupo === '') {
        meeti.cupo = 0;
    }

    meeti.id = uuid();

    //* Almacenar en la base de datos
    try {
        await Meeti.create(meeti);
        req.flash('exito', 'Se ha creado el Meeti Correctamente');
        res.redirect('/administracion');
    } catch (error) {
        console.log(error);

        //* Extraer el menssage de los errores
        const erroresSequelize = error.errors.map(err => err.message) ?? [];

        req.flash('error', erroresSequelize);
        res.redirect('/nuevo-meeti')
    }
}

const sanitizarMeeti = async (req, res, next) => {
    //! Sanitizar los campos
    const campos = [
        body('titulo').escape(),
        body('invitado').escape(),
        body('cupo').escape(),
        body('fecha').escape(),
        body('hora').escape(),
        body('direccion').escape(),
        body('ciudad').escape(),
        body('pais').escape(),
        body('lat').escape(),
        body('lng').escape(),
        body('grupoId').escape(),
        body('descripcion').escape()
    ]

    await Promise.all(campos.map(val => val.run(req)));

    next();
}

//* Muestra el Formulario Para Editar Meeti
const formEditarMeeti = async (req,res,next) => {
    const consultas = [
        Grupos.findAll({ where: { usuarioId: req.user.id } }),
        Meeti.findByPk(req.params.id)
    ];

    const [grupos, meeti] = await Promise.all(consultas);

    if(!grupos, !meeti){
        req.flash('error', 'Operación no valida');
        res.redirect('/nuevo-meeti');
        return next();
    }

    //* Mostrar la vista
    res.render('editar-meeti', {
        nombrePagina: `Editar Meeti: ${meeti.titulo}`,
        grupos,
        meeti
    })
}

const editarMeeti = async (req,res,next) => {
    const meeti = await Meeti.findOne({
        where: { id: req.params.id, usuarioId: req.user.id }
    });

    if(!meeti){
        req.flash('error', 'Operación no valida');
        res.redirect('/administracion');
        return next();
    }

    //* Asignar valores
    const { grupoId, titulo, invitado, fecha, hora, cupo, descripcion, direccion, ciudad, estado, pais, lat, lng } = req.body;

    meeti.grupoId = grupoId;
    meeti.titulo = titulo;
    meeti.invitado = invitado;
    meeti.fecha = fecha;
    meeti.hora = hora;
    meeti.cupo = cupo;
    meeti.descripcion = descripcion;
    meeti.direccion = direccion;
    meeti.ciudad = ciudad;
    meeti.estado = estado;

    //* Asignar ubicacion
    const point = { type: 'Point', coordinates: [parseFloat(lat),parseFloat(lng)] };
    meeti.ubicacion = point;

    //* Almacenar en la BD
    try {
        await meeti.save();
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

/**
 *? Eliminar Meeti
*/
const formEliminarMeeti = async (req,res) => {
    const meeti = await Meeti.findOne({where: { 
        id: req.params.meetiId,
        usuarioId: req.user.id
    }});

    if(!meeti) {
        req.flash('error', 'Operación no valida');
        res.redirect('/administracion');
        return next();
    }

    //? Todo bien, ejecutar la vista
    res.render('eliminar-meeti', {
        nombrePagina: `Eliminar Meeti: ${meeti.titulo}`
    })
}

const eliminarMeeti = async (req,res) => {
    const meeti = await Meeti.findOne({where: { 
        id: req.params.meetiId,
        usuarioId: req.user.id
    }});

    if(!meeti) {
        req.flash('error', 'Operación no valida');
        res.redirect('/administracion');
        return next();
    }

    await Meeti.destroy({
        where: {
            id: req.params.meetiId
        }
    });

    //* Redireccionar al usuari
    req.flash('exito','Meeti Eliminado');
    res.redirect('/administracion');
}


export {
    formNuevoMeeti,
    crearMeeti,
    sanitizarMeeti,
    formEditarMeeti,
    editarMeeti,
    formEliminarMeeti,
    eliminarMeeti
}

