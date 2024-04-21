import Comentario from '../../models/Comentarios.js';
import Meeti from '../../models/Meeti.js';

const agregarComentario = async (req,res,next) => {
    //* Obtener el comentario
    const {comentario} = req.body;

    //* Crear comentario en BD
    await Comentario.create({
        mensaje: comentario,
        usuarioId: req.user.id,
        meetiId: req.params.id
    });

    //* Redireccionar el usuario a la misma pagina
    res.redirect('back');
    next();
}

//* Elimina un comentario
const eliminarComentario = async (req,res,next) => {
    //* Tomar el Id del comentario
    const {comentarioId} = req.body;

    //* Consultar el comentario
    const comentario = await Comentario.findOne({where: {id: comentarioId}});

    if(!comentario){
        res.status(404).send('Accion no válida');
        return next();
    }

    //* Consultar el meeti del comentario
    const meeti = await Meeti.findOne({ 
        where: { id: comentario.meetiId },
        attributes: ['id','usuarioId']
    });
    
    if(comentario.usuarioId === req.user.id || meeti.usuarioId === req.user.id){
        await Comentario.destroy({
            where: { id: comentario.id }
        });

        res.status(200).send('Eliminado Correctamente');
        return next();
    }else{
        res.status(403).send('Accion no válida');
        return next();
    }
}

export{ 
    agregarComentario,
    eliminarComentario
}