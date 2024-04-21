import moment from "moment";
import Grupos from "../../models/Grupos.js";
import Meeti from "../../models/Meeti.js"
import Usuarios from "../../models/Usuarios.js";
import { Op, Sequelize } from "sequelize";
import validator from "validator";
import Categorias from "../../models/Categorias.js";
import Comentario from "../../models/Comentarios.js";

const mostrarMeeti = async (req,res) => {
    const meeti = await Meeti.findOne({
        where: {
            slug: req.params.slug
        },
        include: [
            {
                model: Grupos
            },
            {
                model: Usuarios,
                attributes: ['id','nombre','imagen']
            }
        ]
    });
    
    if(!meeti){
        res.redirect('/');
    }

    //* Consultar por meeti's cercanos
    const ubicacion = Sequelize.literal(`ST_GeomFromText( 'POINT(${meeti.ubicacion.coordinates[0]} ${meeti.ubicacion.coordinates[1]})' )`);

    //*ST_DISTANCE_Sphere = Retorna una linea en metros
    const distancia = Sequelize.fn('ST_DistanceSphere', Sequelize.col('ubicacion'), ubicacion);

    //* Encontrar Meeti's cercanos
    const cercanos = await Meeti.findAll({
        order: distancia,
        where: Sequelize.where(distancia, { [Op.lte]: 2000 }),
        limit: 3,
        offset: 1,
        include: [
            {
                model: Grupos
            },
            {
                model: Usuarios,
                attributes: ['id','nombre','imagen']
            }
        ]
    })

    meeti.descripcion = validator.unescape(meeti.descripcion);

    const comentarios = await Comentario.findAll({
        where: { meetiId: meeti.id },
        include: [
            {
                model: Usuarios,
                attributes: ['id','nombre','imagen']
            }
        ]
    });

    //* Pasar resultado hacia la vista
    return res.render('mostrar-meeti', {
        nombrePagina: meeti.titulo,
        meeti,
        comentarios,
        cercanos,
        moment
    });
}

//* confirma o cancela si el usuario asistirá al meeti
const confirmarAsistencia = async (req,res) => {
    const {accion} = req.body;

    if(accion === 'confirmar'){
        await Meeti.update(
            {'interesados': Sequelize.fn('array_append', Sequelize.col('interesados'), req.user.id)},
            {where: {'slug': req.params.slug}}
        );

        //* Mensaje
        res.send('Has confirmado tu asistencia');
    }else{
        await Meeti.update(
            {'interesados': Sequelize.fn('array_remove', Sequelize.col('interesados'), req.user.id)},
            {where: {'slug': req.params.slug}}
        );

        //* Mensaje
        res.send('Has cancelado tu asistencia');
    }    
}

//* Mostrando asistentes
const mostrarAsistentes = async (req,res) => {
    const meeti = await Meeti.findOne({
        where: { slug: req.params.slug },
        attributes: ['interesados']
    });

    const { interesados } = meeti;

    const asistentes = await Usuarios.findAll({
        attributes: ['nombre','imagen'],
        where: {
            id: interesados
        }
    });

    //* Crear la vista y apasar los datos
    res.render('asistentes-meeti', {
        nombrePagina: 'Listado Asistentes Meeti',
        asistentes
    })
}

//* Muestra los meetis por categoria
const mostrarCategoria = async (req,res,next) => {
    const categoria = await Categorias.findOne({
        attributes: ['id','nombre'],
        where: { slug: req.params.categoria }
    });

    const meetis = await Meeti.findAll({
        include: [
            {
                model: Grupos,
                where: { categoriaId: categoria.id }
            },
            {
                model: Usuarios
            }
        ],
        order: [ ['fecha', 'ASC'] ]
    });

    res.render('categoria', {
        nombrePagina: `Categoria: ${categoria.nombre}`,
        meetis,
        moment
    })
}

export{
    mostrarMeeti,
    confirmarAsistencia,
    mostrarAsistentes,
    mostrarCategoria
}