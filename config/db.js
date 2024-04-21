import { Sequelize } from "sequelize";
import dotenv from 'dotenv'

dotenv.config({path: 'variables.env'});

const db = new Sequelize(process.env.BD_NOMBRE, process.env.BD_USER, process.env.BD_PASS, {
    host: process.env.BD_HOST,
    port: 5432,
    dialect: 'postgres',
    pool:{
        max: 50,
        min: 0,
        acquire: 30000,
        idle: 10000
    },
    //logging: false Desabilita mostrar los query en los log
});

export default db;
