import express from 'express'; 

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

usersRouter.post  ('/users/signin', handleSignin); 
usersRouter.post  ('/users/register', handleRegister); 
usersRouter.get   ('/users', httpGetAllUsers); 
usersRouter.get   ('/users/profile/:id', httpGetUser); 
usersRouter.put   ('/users/update-user/:id',httpUpdateUser);
usersRouter.get   ('/users/confirm-email/:id/:uniqueString', handleRegisterOrUpdateEmailConfirmation); 
usersRouter.get   ('/users/user-message', handleEmailConfirmationVerified); 
usersRouter.put   ('/users/update-user-email/:id',httpUpdateUserEmail);
usersRouter.get   ('/users/forgot-password', httpRenderForgotPassword);
usersRouter.post  ('/users/forgot-password', httpPostForgotPassword);
usersRouter.get   ('/users/reset-password/:id/:uniqueString', handleForgotPasswordConfirmation); // httpResetPassword 
usersRouter.post  ('/users/reset-password/:id/:uniqueString', httpPostResetPassword); // handleForgotPasswordConfirmation
usersRouter.delete('/users/delete/:id', handleUserDelete); 

export default usersRouter;

