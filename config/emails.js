import dotenv from "dotenv";

dotenv.config({path: '../variables.env'});

const emailConfig = {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
    host: process.env.EMAIL_HOST,
    port: process.env.EMAIL_PORT
}

export default emailConfig;