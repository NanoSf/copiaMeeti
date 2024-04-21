import passport from "passport";
import { Strategy } from "passport-local";

import Usuarios from "../models/Usuarios.js";


passport.use( new Strategy({
        usernameField: 'email',
        passwordField: 'password'
    },
    async(email,password,next) =>{
        //* Codigo se ejecuta al llenar el formulario
        const usuario = await Usuarios.findOne({
            where: { email }
        });

        //* Revisar si existe o no
        if (!usuario) return next(null, false, {
            message: 'Ese usuario no existe'
        });

        //* Revisar si esta confirmado el usuario
        if(usuario.activo === 0) return next(null, false, { message: 'Confirma tu cuenta para continuar' })

        //* El usuario existe compara su passport
        const verificarPass = usuario.validarPassword(password);

        //* Si el password es diferente
        if(!verificarPass) return next(null, false, {
            message: 'Password Incorrecto'
        });

        //* Todo bien
        return next(null, usuario);
    }
));

passport.serializeUser(function(usuario, cb){
    cb(null,usuario);
});

passport.deserializeUser(function(usuario, cb){
    cb(null,usuario);
});

export default passport;