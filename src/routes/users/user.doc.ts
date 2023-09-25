// Reference: https://editor.swagger.io/ 

const user = {
    id: 0,
    name: "John Doe",
    cpf: "00000000000",
    email: "jane.doe@email.com",
    created_at: "2023-07-24T16:17:28.509Z",
    updated_at: "2023-09-17T16:17:28.601Z",
    verified: false
};

const success200 = {
    description: "Success",
    content: {
        "application/json": {
            schema:{
                type: "object",
                example: user
            }
        }
    }
};

const success201 = {
    description: "Success",
    content: {
        "application/json": {
            schema:{
                type: "object",
                example: user
            }
        }
    }
};

const notFound404 = {
    description: "User not found",
    content: {
        "application/json": {
            schema:{
                type: "object",
                example: {error: 'user not found' }
            }
        }
    }
};

const conflict409 = {
    description: "Conflict",
    content: {
        "application/json": {
            schema:{
                type: "object",
                example: {error: 'email or cpf already in use' }
            }
        }
    }
};

const internal500 = {
    description: "Internal error",
    content: {
        "application/json": {
            schema:{
                type: "object",
                example: { error: 'error during process' }
            }
        }
    }
};

// usersRouter.post  ('/users/signin', handleSignin); 

// usersRouter.post  ('/users/register', handleRegister); 
const usersRegisterSchema = {
    post: {
        tags: ["User"],
        description: "Register a new user",
        requestBody: {
            content: {
                "application/json": {
                    schema: {
                        type: "object",
                        properties: {
                            email: {
                                type: "string",
                                description: "Email of the user",
                                example: "john.doe@email.com"
                            },
                            password: {
                                type: "string",
                                description: "Password with at least 8 characters",
                                example: "J0hnD0&p@ssw0rd!"
                            },
                            name: {
                                type: "string",
                                description: "Name of the user",
                                example: "John Doe"
                            },
                            cpf: {
                                type: "number",
                                description: "Brazilian doc number - numbers only - eleven characters",
                                example: "00000000000"
                            },
                        }
                    }
                }
            }
        },
        responses:{
            201: success201,
            409: conflict409,
            500: internal500,
        } 
    }
};

// usersRouter.get   ('/users', httpGetAllUsers); 
const usersSchema = {
    get: {
        tags: ["User"],
        description: "List of all current users",
        responses:{
            200: success200,
            500: internal500,
        } 
    }
};

// usersRouter.get   ('/users/profile/:id', httpGetUser); 
const usersByIdSchema = {
    get: {
        tags: ["User"],
        summary: "Get user from path id",
        description: "Get user by id",
        parameters: [
            {
                name: "id",
                in: "path",
                description: "id of the user",
                type: "number",
                example: "5678",
            },
        ],
        responses:{
            200: success200,
            404: notFound404,
            500: internal500,
        } 
    }
};

// usersRouter.put   ('/users/update-user/:id',httpUpdateUser);
// usersRouter.get   ('/users/confirm-email/:id/:uniqueString', handleRegisterOrUpdateEmailConfirmation); 
// usersRouter.get   ('/users/user-message', handleEmailConfirmationVerified); 
// usersRouter.put   ('/users/update-user-email/:id',httpUpdateUserEmail);
// usersRouter.get   ('/users/forgot-password', httpRenderForgotPassword);
// usersRouter.post  ('/users/forgot-password', httpPostForgotPassword);
// usersRouter.get   ('/users/reset-password/:id/:uniqueString', handleForgotPasswordConfirmation); // httpResetPassword 
// usersRouter.post  ('/users/reset-password/:id/:uniqueString', httpPostResetPassword); // handleForgotPasswordConfirmation
// usersRouter.delete('/users/delete/:id', handleUserDelete); 

export const userRouteDoc = {
    "/users/register":      usersRegisterSchema,
    "/users":               usersSchema,
    "/users/profile/{id}":  usersByIdSchema
};