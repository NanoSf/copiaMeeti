import Categorias from "../models/Categorias.js";
import Grupos from "../models/Grupos.js";
import Meeti from "../models/Meeti.js";
import moment from "moment";
import { Sequelize } from "sequelize";
import Usuarios from "../models/Usuarios.js";

const Op = Sequelize.Op;

const home = async (req,res) => {
    const consultas = [
        Categorias.findAll(),
        Meeti.findAll({
            attributes: ['slug','titulo','fecha', 'hora'],
            where: {
                fecha: { [Op.gte] : moment(new Date).format("YYYY-MM-DD") }
            },
            limit: 3,
            order: [
                ['fecha', 'ASC']
            ],
            include: [
                {
                    model: Grupos, 
                    attributes: ['imagen']
                },
                {
                    model: Usuarios, 
                    attributes: ['nombre', 'imagen']
                }
            ]
        })
    ];

    const [categorias, meetis] = await Promise.all(consultas);
    
    res.render('home', {
        nombrePagina: 'Inicio',
        categorias,
        meetis,
        moment
    });
}

export{
    home
}