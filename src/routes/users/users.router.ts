import express, { Request, Response, NextFunction } from 'express'; 

import  {
    handleLogin,
    handleRegister,
    renderForgotPasswordPage,
    postForgotPasswordEmail,
    postResetPassword,
    handleForgotPasswordConfirmationReturn,
    handleRefreshToken,
    handleLogout,
    listAllUsers,
    httpGetUser,
    httpUpdateUser,
    handleRegisterOrUpdateEmailConfirmation,
    httpUpdateUserEmail,
    handleEmailConfirmationVerified,
    handleUserDelete
} from './users.controller';

const usersRouter = express.Router();

import verifyJWT from '../../middleware/verifyJWT';

usersRouter.post  ('/users/signin', handleLogin); 
usersRouter.post  ('/users/register', handleRegister); 
usersRouter.get   ('/users/confirm-email/:id/:uniqueString', handleRegisterOrUpdateEmailConfirmation);
usersRouter.get   ('/users/user-message', handleEmailConfirmationVerified); 
usersRouter.get   ('/users/forgot-password', renderForgotPasswordPage);
usersRouter.post  ('/users/forgot-password', postForgotPasswordEmail);
usersRouter.get   ('/users/reset-password/:id/:uniqueString', handleForgotPasswordConfirmationReturn); 
usersRouter.post  ('/users/reset-password/:id/:uniqueString', postResetPassword); 
usersRouter.get   ('/users/refresh', handleRefreshToken);
usersRouter.get   ('/users/logout', handleLogout);

usersRouter.get   ('/users', verifyJWT, listAllUsers); 
usersRouter.get   ('/users/profile/:id', verifyJWT, httpGetUser); 
usersRouter.put   ('/users/update-user/:id',verifyJWT, httpUpdateUser); 
usersRouter.put   ('/users/update-user-email/:id', verifyJWT, httpUpdateUserEmail);
usersRouter.delete('/users/delete/:id', verifyJWT, handleUserDelete); 

export default usersRouter;

