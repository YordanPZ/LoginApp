const catchError = require('../utils/catchError');
const User = require('../models/User');
const bcrypt = require('bcrypt');
const sendEmail = require('../utils/sendEmail');
const EmailCode = require('../models/EmailCode');
const jwt = require('jsonwebtoken');

const getAll = catchError(async (req, res) => {
  const results = await User.findAll();
  return res.json(results);
});

const create = catchError(async (req, res) => {
  const { firstName, lastName, email, password, country, image,frontBaseUrl } = req.body;
  const hashedPassword = await bcrypt.hash(password, 10);
  const result = await User.create({ //La funcion de crear añade parametros extra, entre ellos el id
    firstName,
    lastName,
    email,
    password: hashedPassword,
    country,
    image,
  });
  const code = require('crypto').randomBytes(32).toString('hex');
  const link = `${frontBaseUrl}/auth/verify_email/${code}`;
  
  await EmailCode.create({
    code,
    userId: result.id
  })

  await sendEmail({
    to: email,
    subject: "Verificate email for user App",
    html:`
    <h1>Welcome to the app, ${firstName}</h1>
    <p>Thanks for registering, please verify your email by clicking on the link below</p>
    <a href="${link}">${link}</a>
    `
  })
  return res.status(201).json(result);
});

const getOne = catchError(async (req, res) => {
  const { id } = req.params;
  const result = await User.findByPk(id);
  if (!result) return res.sendStatus(404);
  return res.json(result);
});

const remove = catchError(async (req, res) => {
  const { id } = req.params;
  await User.destroy({ where: { id } });
  return res.sendStatus(204);
});

const update = catchError(async (req, res) => {
  const { id } = req.params;
  const result = await User.update(
    req.body,
    { where: { id }, returning: true }
  );
  if (result[0] === 0) return res.sendStatus(404);
  return res.json(result[1][0]);
});

const verifyEmail = catchError(async (req, res) => {
  const { code } = req.params;
  const emailCode = await EmailCode.findOne({ where: { code } }); //Busco el codigo del usuario en la base de email code
  if (!emailCode) return res.status(404).json({mensaje: "Codigo invalido"})
  //const user = await User.update({ isVerified: true }, { where: { id: emailCode.userId } }, {returning: true}); ( Primero los datos a cambiar (el body), {despues donde lo queremos cambiar},{despues retorno el usuario cambiado})
  const user = await User.findByPk(emailCode.userId); //Leo la propuedad userId para saber que usuario es
  if (!user) return res.status(404).json({mensaje: "Codigo invalido"})
  user.isVerified = true; //Le asigno el valor true al campo isVerified
  await user.save() //Guardo el usuario
  await emailCode.destroy(); //Elimino el codigo del usuario de la base de email code
  return res.json(user); //Devuelvo el usuario
})

const login = catchError(async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findOne({ where: { email } });
  if (!user) return res.status(404).json({mensaje: "Credenciales invalidas"})
  const passwordIsValid = await bcrypt.compare(password, user.password);
  if (!passwordIsValid) return res.status(404).json({mensaje: "Credenciales invalidas"})
  const isVerified = user.isVerified;
  if (!isVerified) return res.status(404).json({mensaje: "El usuario no esta verificado"})
  const token = jwt.sign({user}, process.env.TOKEN_SECRET, {expiresIn: "1d"})
  return res.json({user, token})
})

const getLoggedUser = catchError(async (req, res) => {
  const { user } = req;
  return res.json(user);
})

const resetPassword = catchError(async (req, res) => {
  const { email,frontBaseUrl } = req.body;
  const user = await User.findOne({ where: { email } }); 
  if(!user) return res.status(404).json({mensaje: "El usuario no existe"})
  const code = require('crypto').randomBytes(32).toString('hex');
  const link = `${frontBaseUrl}/auth/reset_password/${code}`;
  await sendEmail({
    to: email,
    subject: "Change password for user App",
    html:`
    <h1>Do you want to change your password?, ${user.firstName}</h1>
    <p>We recived a request to change your password, please continue with the link below</p>
    <a href="${link}">${link}</a>
    `
  })
  await EmailCode.create({
    code,
    userId: user.id
  })
  return res.json(user);
}) 

const verifyCodePassword = catchError(async (req, res) => {
  const { code } = req.params;
  const { password } = req.body;
  const emailCode = await EmailCode.findOne({ where: { code } }); //Busco el codigo del usuario en la base de email code
  if(!emailCode) return res.status(404).json({mensaje: "Codigo invalido"})
  const hashedPassword = await bcrypt.hash(password, 10);
  const user = await User.findByPk(emailCode.userId); //Leo la propiedad userId para saber que usuario es
  if(!user) return res.status(404).json({mensaje: "Codigo invalido"})
  user.password = hashedPassword;
  await user.save() //Guardo el usuario
  await emailCode.destroy(); //Elimino el codigo del usuario de la base de email code
  return res.json(user); //Devuelvo el usuario
})

module.exports = {
  getAll,
  create,
  getOne,
  remove,
  update,
  verifyEmail,
  login,
  getLoggedUser,
  resetPassword,
  verifyCodePassword
}