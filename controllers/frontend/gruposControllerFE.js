import moment from "moment";
import Grupos from "../../models/Grupos.js";
import Meeti from "../../models/Meeti.js";
import { validator } from "sequelize/lib/utils/validator-extras";

const mostrarGrupo = async (req,res,next) => {
    const consultas = [
        Grupos.findOne({ where: { id: req.params.id } }),
        Meeti.findAll({ where: {grupoId: req.params.id},
            order: [ ['fecha', 'ASC'] ]
        })
    ];

    const [grupo,meetis] = await Promise.all(consultas);

    //* Si no hay grupo
    if(!grupo){
        res.redirect('/');
        return next();
    }

    grupo.descripcion = validator.unescape(grupo.descripcion);
    grupo.url = validator.unescape(grupo.url);
    //* Mostrar la vista
    res.render('mostrar-grupo', {
        nombrePagina: `Información Grupo: ${grupo.nombre}`,
        grupo,
        meetis,
        moment
    })

}

export{
    mostrarGrupo
}