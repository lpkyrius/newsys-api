"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const users_controller_1 = require("./users.controller");
const usersRouter = express_1.default.Router();
const verifyJWT_1 = __importDefault(require("../../middleware/verifyJWT"));
usersRouter.post('/users/signin', users_controller_1.handleLogin);
const verifyJWT_1 = __importDefault(require("../../middleware/verifyJWT"));
usersRouter.post('/users/signin', users_controller_1.handleLogin);
usersRouter.post('/users/register', users_controller_1.handleRegister);
usersRouter.get('/users/confirm-email/:id/:uniqueString', users_controller_1.handleRegisterOrUpdateEmailConfirmation);
usersRouter.get('/users/user-message', users_controller_1.handleEmailConfirmationVerified);
usersRouter.get('/users/forgot-password', users_controller_1.renderForgotPasswordPage);
usersRouter.post('/users/forgot-password', users_controller_1.postForgotPasswordEmail);
usersRouter.get('/users/reset-password/:id/:uniqueString', users_controller_1.handleForgotPasswordConfirmationReturn);
usersRouter.post('/users/reset-password/:id/:uniqueString', users_controller_1.postResetPassword);
usersRouter.get('/users/refresh', users_controller_1.handleRefreshToken);
usersRouter.get('/users/logout', users_controller_1.handleLogout);
usersRouter.get('/users', verifyJWT_1.default, users_controller_1.listAllUsers);
usersRouter.get('/users/profile/:id', verifyJWT_1.default, users_controller_1.httpGetUser);
usersRouter.put('/users/update-user/:id', verifyJWT_1.default, users_controller_1.httpUpdateUser);
usersRouter.put('/users/update-user-email/:id', verifyJWT_1.default, users_controller_1.httpUpdateUserEmail);
usersRouter.delete('/users/delete/:id', verifyJWT_1.default, users_controller_1.handleUserDelete);
exports.default = usersRouter;
