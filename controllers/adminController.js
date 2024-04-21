import Grupos from '../models/Grupos.js';
import Meeti from '../models/Meeti.js';
import moment from 'moment';
import { Op } from 'sequelize';

const panelAdministracion = async (req,res) => {
    const consultas = [
        Grupos.findAll({ where: { usuarioId: req.user.id } }),
        Meeti.findAll({ 
            where: { 
                usuarioId: req.user.id,
                fecha: { [Op.gte]: moment(new Date()).format('YYYY-MM-DD') }
        },
            order: [
                ['fecha','ASC']
            ]
        }),
        Meeti.findAll({ where: { 
            usuarioId: req.user.id,
            fecha: { [Op.lt]: moment(new Date()).format('YYYY-MM-DD') }
        }})
    ];

    const [grupos, meetis, anteriores] = await Promise.all(consultas);

    res.render('administracion', {
        nombrePagina: 'Panel de Administracion',
        grupos,
        meetis,
        anteriores,
        moment
    })
}

export{
    panelAdministracion
}