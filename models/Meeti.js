import Sequelize from "sequelize";
import slug from "slug";
import shortid from "shortid";

import db from '../config/db.js';
import Usuario from '../models/Usuarios.js';
import Grupos from '../models/Grupos.js';

const Meeti = db.define('meeti', {
    id: {
        type: Sequelize.UUID,
        primaryKey: true,
        allowNull: false
    },
    titulo: {
        type: Sequelize.STRING,
        allowNull: null,
        validate: {
            notEmpty: {msg: 'Agrega un titulo'}
        }
    },
    slug: Sequelize.STRING,
    invitado: Sequelize.STRING,
    cupo: {
        type: Sequelize.INTEGER,
        defaultValue: 0
    },
    descripcion: {
        type: Sequelize.TEXT,
        allowNull: false,
        validate: {
            notEmpty: {msg: 'Agrega una descripcion'}
        }
    },
    fecha: {
        type: Sequelize.DATEONLY,
        allowNull: false,
        validate: {
            notEmpty: {msg: 'Agrega una fecha para el meeti'}
        }
    },
    hora: {
        type: Sequelize.TIME,
        allowNull: false,
        validate: {
            notEmpty: {msg: 'Agrega una hora para el meeti'}
        }
    },
    direccion: {
        type: Sequelize.STRING,
        allowNull: false,
        validate: {
            notEmpty: {msg: 'Agrega una direccion'}
        }
    },
    ciudad: {
        type: Sequelize.STRING,
        allowNull: false,
        validate: {
            notEmpty: {msg: 'Agrega una ciudad'}
        }
    },
    estado: {
        type: Sequelize.STRING,
        allowNull: false,
        validate: {
            notEmpty: {msg: 'Agrega un estado'}
        }
    },
    pais: {
        type: Sequelize.STRING,
        allowNull: false,
        validate: {
            notEmpty: {msg: 'Agrega una pais'}
        }
    },
    ubicacion: {
        type: Sequelize.GEOMETRY('POINT')
    },
    interesados: {
        type: Sequelize.ARRAY(Sequelize.INTEGER),
        defaultValue: []
    }

}, {
    hooks: {
        async beforeCreate(meeti){
            const url = slug(meeti.titulo).toLowerCase();
            meeti.slug = `${url}-${shortid.generate()}`;
        }
    }
});

Meeti.belongsTo(Usuario);
Meeti.belongsTo(Grupos);

export default Meeti;

