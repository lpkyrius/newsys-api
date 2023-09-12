"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const users_controller_1 = require("./users.controller");
// const { response } = require('../../app');
const usersRouter = express_1.default.Router();
usersRouter.post('/users/signin', users_controller_1.handleSignin);
usersRouter.post('/users/register', users_controller_1.handleRegister);
usersRouter.get('/users', users_controller_1.httpGetAllUsers);
usersRouter.get('/users/profile/:id', users_controller_1.httpGetUser);
usersRouter.put('/users/update-user/:id', users_controller_1.httpUpdateUser);
usersRouter.get('/users/confirm-email/:id/:uniqueString', users_controller_1.handleRegisterOrUpdateEmailConfirmation);
usersRouter.get('/users/user_message', users_controller_1.handleEmailConfirmationVerified);
usersRouter.put('/users/update-user-email/:id', users_controller_1.httpUpdateUserEmail);
usersRouter.get('/users/forgot-password', users_controller_1.httpRenderForgotPassword);
usersRouter.post('/users/forgot-password', users_controller_1.httpPostForgotPassword);
usersRouter.get('/users/reset-password/:id/:uniqueString', users_controller_1.handleForgotPasswordConfirmation); // httpResetPassword 
usersRouter.post('/users/reset-password/:id/:uniqueString', users_controller_1.httpPostResetPassword); // handleForgotPasswordConfirmation
// usersRouter.post('/users/delete', handleDelete); 
exports.default = usersRouter;
