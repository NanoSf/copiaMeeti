import validator from "validator";
import Grupos from "../../models/Grupos.js";
import Usuarios from "../../models/Usuarios.js";

const mostrarUsuario = async (req,res,next) => {
    const consultas = [
        Usuarios.findOne({ where: { id: req.params.id } }),
        Grupos.findAll({ where: { usuarioId: req.params.id } })
    ];

    const [usuario,grupos] = await Promise.all(consultas);
    

    if(!usuario){
        res.redirect('/');
        return next();
    }

    usuario.descripcion = validator.unescape(usuario.descripcion);

    res.render('mostrar-perfil', {
        nombrePagina: `Perfil Usuario: ${usuario.nombre}`,
        usuario,
        grupos
    })
}

export{
    mostrarUsuario
}