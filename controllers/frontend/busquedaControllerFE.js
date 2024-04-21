import { Op } from "sequelize";
import Meeti from "../../models/Meeti.js";
import moment from "moment";
import Grupos from "../../models/Grupos.js";
import Usuarios from "../../models/Usuarios.js";

const resultadosBusqueda = async (req,res) => {
    //* Leer datos del la url
    const {categoria,titulo,ciudad,pais} = req.query;
    
    let query;
    //* Si la categoria esta vacia
    if(categoria === ''){
        query = '';
    }else{
        query = `where: { categoriaId: { [Op.eq]: ${categoria} } }`;
    }

    //* Filtrar los meeti's por los terminos de la busqueda
    const meetis = await Meeti.findAll({
        where: {
            titulo: { [Op.iLike]: '%' + titulo + '%' },
            ciudad: { [Op.iLike]: '%' + ciudad + '%' },
            pais: { [Op.iLike]: '%' + pais + '%' }
        },
        include: [
            {
                model: Grupos,
                query
            },
            {
                model: Usuarios,
                attributes: ['id', 'nombre', 'imagen']
            }
        ]
    });

    //* Pasar resultados a la vista
    res.render('busqueda', {
        nombrePagina: 'Resultado Búsqueda',
        meetis,
        moment
    })
}

export{
    resultadosBusqueda
}