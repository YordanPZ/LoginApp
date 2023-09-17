const User = require("./User");
const EmailCode = require("./EmailCode");

EmailCode.belongsTo(User, { foreignKey: "userId" }); //la tabla que lleva la llave foranea es la tabla Emailcode, por ende le aplico el belongTo a esa tabla que es la que recibira la llave
User.hasOne(EmailCode, { foreignKey: "userId" });