const { DataTypes } = require('sequelize');
const sequelize = require('../utils/connection');

const EmailCode = sequelize.define('emailcode', { //GUARDO EL EMAIL Y EL CODIGO ENVIADO AL EMAIL PARA PODER VERIFICARLO, LO GUARDO DESDE EL USER CREADO
    code: {
        type: DataTypes.STRING,
        allowNull: false
    }
});

module.exports = EmailCode;