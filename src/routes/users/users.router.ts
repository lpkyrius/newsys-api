import express, { Request, Response, NextFunction } from 'express'; 

import  {
    handleSignin,
    handleRegister,
    httpGetAllUsers,
    httpGetUser,
    httpUpdateUser,
    handleRegisterOrUpdateEmailConfirmation,
    httpUpdateUserEmail,
    handleEmailConfirmationVerified,
    httpRenderForgotPassword,
    httpPostForgotPassword,
    httpPostResetPassword,
    handleForgotPasswordConfirmation,
    handleUserDelete
} from './users.controller';

const usersRouter = express.Router();

import verifyJWT from '../../middleware/verifyJWT';

usersRouter.post  ('/users/signin', handleSignin); 
usersRouter.post  ('/users/register', handleRegister); 
usersRouter.get   ('/users/forgot-password', httpRenderForgotPassword);
usersRouter.post  ('/users/forgot-password', httpPostForgotPassword);
usersRouter.get   ('/users/reset-password/:id/:uniqueString', handleForgotPasswordConfirmation); // httpResetPassword 
usersRouter.post  ('/users/reset-password/:id/:uniqueString', httpPostResetPassword); // handleForgotPasswordConfirmation

usersRouter.get   ('/users', verifyJWT, httpGetAllUsers); 
usersRouter.get   ('/users/profile/:id', verifyJWT, httpGetUser); 
usersRouter.put   ('/users/update-user/:id',verifyJWT, httpUpdateUser);
usersRouter.get   ('/users/confirm-email/:id/:uniqueString', verifyJWT, handleRegisterOrUpdateEmailConfirmation); 
usersRouter.get   ('/users/user-message', verifyJWT, handleEmailConfirmationVerified); 
usersRouter.put   ('/users/update-user-email/:id', verifyJWT, httpUpdateUserEmail);
usersRouter.delete('/users/delete/:id', verifyJWT, handleUserDelete); 

export default usersRouter;

