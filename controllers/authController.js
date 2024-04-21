import passport from "passport"

const autenticarUsuario = passport.authenticate('local', {
    successRedirect: '/administracion',
    failureRedirect: '/iniciar-sesion',
    failureFlash: true,
    badRequestMessage: 'Ambos campos son obligatorios'
})

//* Revisa si el usuario esta autenticado o no
const usuarioAutenticado = (req,res,next) => {
    //* Si el usuario esta autenticado, adelante
    if(req.isAuthenticated()) return next();

    //* Sino esta autenticado
    return res.redirect('/iniciar-sesion');
}

export{
    autenticarUsuario,
    usuarioAutenticado
}