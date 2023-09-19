const { getAll, create, getOne, remove, update,verifyEmail,login,getLoggedUser,resetPassword,verifyCodePassword,send } = require('../controllers/user.controllers');
const express = require('express');
const verifyJWT = require('../utils/verifyJWT');

const userRouter = express.Router();

userRouter.route('/')
    .get(verifyJWT,getAll)
    .post(create);

userRouter.route('/send')
    .post(send);

userRouter.route('/:id')
    .get(verifyJWT,getOne)

userRouter.route('/verify/:code')
    .get(verifyEmail);

userRouter.route('/login')
    .post(login);

userRouter.route('/reset_password')
    .post(resetPassword);

userRouter.route('/reset_password/:code')
    .post(verifyCodePassword);

userRouter.route('/me')
    .get(verifyJWT,getLoggedUser);

userRouter.route('/:id')
    .get(verifyJWT,getOne)
    .delete(verifyJWT,remove)
    .put(verifyJWT,update);

module.exports = userRouter;