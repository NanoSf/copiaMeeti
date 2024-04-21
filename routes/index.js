//* Dependencias
import express from 'express';
import multer from 'multer';
import shortid from 'shortid';

//* Locales
import { home } from '../controllers/homeController.js';
import { 
    formCrearCuenta,
    crearNuevaCuenta,
    formIniciarSesion,
    confirmarCuenta,
    formEditarPerfil,
    editarPerfil,
    sanitizarUsuario,
    formCambiarPassword,
    cambiarPassword,
    formSubirImagenPerfil,
    guardarImagenPerfil,
    subirImagen as subirImagenPerfil,
    cerrarSesion
} from '../controllers/usuariosController.js';
import { autenticarUsuario, usuarioAutenticado } from '../controllers/authController.js';
import { panelAdministracion } from '../controllers/adminController.js';
import { 
    formNuevoGrupo, 
    crearGrupo, 
    subirImagen, 
    formEditarGrupo, 
    editarGrupo,
    formEditarImagen,
    editarImagen,
    formEliminarGrupo,
    eliminarGrupo
} from '../controllers/gruposController.js';
import { formNuevoMeeti, crearMeeti, sanitizarMeeti, formEditarMeeti, editarMeeti, formEliminarMeeti, eliminarMeeti } from '../controllers/meetiController.js';
import { mostrarMeeti, confirmarAsistencia, mostrarAsistentes, mostrarCategoria } from '../controllers/frontend/meetiControllerFE.js';
import { mostrarUsuario } from '../controllers/frontend/usuariosControllerFE.js';
import { mostrarGrupo } from '../controllers/frontend/gruposControllerFE.js';
import { agregarComentario, eliminarComentario } from '../controllers/frontend/comentariosControllerFE.js';
import { resultadosBusqueda } from '../controllers/frontend/busquedaControllerFE.js';

const router = express.Router();

/**
 * ! AREA PUBLICA
 */
//* Inicio
router.get('/', home);

//* Muestra un meeti
router.get('/meeti/:slug',
    mostrarMeeti
);

//* Confirmar la asistencia a meeti
router.post('/confirmar-asistencia/:slug', 
    confirmarAsistencia
);

//* Muestra asistentes al meeti
router.get('/asistentes/:slug',
    mostrarAsistentes
);

//* Agrega comentarios en el meeti
router.post('/meeti/:id',
    usuarioAutenticado,
    agregarComentario
);

//* Elimina comentarios en el meeti
router.post('/eliminar-comentario',
    eliminarComentario
);

//* Muestra perfiles en el frontend
router.get('/usuarios/:id',
    mostrarUsuario
);

//* Muestra grupos en el frontend
router.get('/grupos/:id',
    mostrarGrupo
);

//* Muestra meetis por categorias
router.get('/categoria/:categoria',
    mostrarCategoria
);

//* Añade la busqueda
router.get('/busqueda',
    resultadosBusqueda
);

//* Creacion de Cuenta y confirmarla
router.get('/crear-cuenta', formCrearCuenta);
router.post('/crear-cuenta', crearNuevaCuenta);
router.get('/confirmar-cuenta/:correo', confirmarCuenta)

//* Iniciar sesion
router.get('/iniciar-sesion', formIniciarSesion);
router.post('/iniciar-sesion', autenticarUsuario);

//* Cerrar sesion
router.get('/cerrar-sesion', 
    usuarioAutenticado,
    cerrarSesion
);

/**
 * ! AREA PRIVADA
 */

//* Panel de administracion
router.get('/administracion',
    usuarioAutenticado,
    panelAdministracion
);

//* Nuevos Grupos
router.get('/nuevo-grupo',
    usuarioAutenticado,
    formNuevoGrupo
);
router.post('/nuevo-grupo',
    usuarioAutenticado,
    subirImagen,
    crearGrupo
);

//* Editar Grupos
router.get('/editar-grupo/:grupoId', 
    usuarioAutenticado,
    formEditarGrupo
);
router.post('/editar-grupo/:grupoId',
    usuarioAutenticado,
    editarGrupo
);

//* Editar Imagenes'
router.get('/imagen-grupo/:grupoId',
    usuarioAutenticado,
    formEditarImagen
);

router.post('/imagen-grupo/:grupoId',
    usuarioAutenticado,
    subirImagen,
    editarImagen
);

//* Eliminar grupo
router.get('/eliminar-grupo/:grupoId',
    usuarioAutenticado,
    formEliminarGrupo
);

router.post('/eliminar-grupo/:grupoId',
    usuarioAutenticado,
    eliminarGrupo
);

//* Nuevos Meeti
router.get('/nuevo-meeti',
    usuarioAutenticado,
    formNuevoMeeti
);
router.post('/nuevo-meeti',
    usuarioAutenticado,
    sanitizarMeeti,
    crearMeeti
);

//* Editar Meeti
router.get('/editar-meeti/:id',
    usuarioAutenticado,
    formEditarMeeti
);
router.post('/editar-meeti/:id',
    usuarioAutenticado,
    sanitizarMeeti,
    editarMeeti
);

//* Eliminar meeti
router.get('/eliminar-meeti/:meetiId',
    usuarioAutenticado,
    formEliminarMeeti
);

router.post('/eliminar-meeti/:meetiId',
    usuarioAutenticado,
    eliminarMeeti
);

//* Editar Informacion de perfil
router.get('/editar-perfil/', 
    usuarioAutenticado,
    formEditarPerfil
);

router.post('/editar-perfil/', 
    usuarioAutenticado,
    sanitizarUsuario,
    editarPerfil
);

//* Modificar el password
router.get('/cambiar-password',
    usuarioAutenticado,
    formCambiarPassword
);

router.post('/cambiar-password',
    usuarioAutenticado,
    cambiarPassword
);

//* Imagenes de perfil
router.get('/imagen-perfil',
    usuarioAutenticado,
    formSubirImagenPerfil
);

router.post('/imagen-perfil',
    usuarioAutenticado,
    subirImagenPerfil,
    guardarImagenPerfil
);

export default router;