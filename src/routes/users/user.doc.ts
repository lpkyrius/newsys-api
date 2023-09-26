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

const return200 = {
    description: "Success",
    content: {
        "application/json": {
            schema:{
                type: "object",
                example: { message: 'success'}
            }
        }
    }
};

const return201 = {
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

const return400 = {
    description: "Invalid",
    content: {
        "application/json": {
            schema:{
                type: "object",
                example: {error: 'invalid data' }
            }
        }
    }
};

const return404 = {
    description: "Not found",
    content: {
        "application/json": {
            schema:{
                type: "object",
                example: {error: 'user not found' }
            }
        }
    }
};

const return409 = {
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

const return500 = {
    description: "Internal error",
    content: {
        "application/json": {
            schema:{
                type: "object",
                example: { error: 'internal error during process' }
            }
        }
    }
};

// usersRouter.post  ('/users/signin', handleSignin); 
const usersSignInSchema = {
    post: {
        tags: ["User"],
        summary: "Sign-in with an user",
        description: "User Sign-in",
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
                        }
                    }
                }
            }
        },
        responses:{
            200: return200,
            400: return400,
            500: return500,
        } 
    }
};

// usersRouter.post  ('/users/register', handleRegister); 
const usersRegisterSchema = {
    post: {
        tags: ["User"],
        summary: "Register new users",
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
            201: return201,
            409: return409,
            500: return500,
        } 
    }
};

// usersRouter.get   ('/users', httpGetAllUsers); 
const usersSchema = {
    get: {
        tags: ["User"],
        summary: "List current users",
        description: "List of all current users",
        responses:{
            200: return200,
            500: return500,
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
            200: return200,
            404: return404,
            500: return500,
        } 
    }
};

// usersRouter.put   ('/users/update-user/:id',httpUpdateUser);
const usersUpdateSchema = {
    put: {
        tags: ["User"],
        summary: "Update user data",
        description: "Update name and cpf of an user",
        parameters: [
            {
                name: "id",
                in: "path",
                description: "id of the user",
                type: "number",
                example: "5678",
            },
        ],
        requestBody: {
            content: {
                "application/json": {
                    schema: {
                        type: "object",
                        properties: {
                            name: {
                                type: "string",
                                description: "Name of the user",
                                example: "John Doe"
                            },
                            cpf: {
                                type: "string",
                                description: "Brazilian CPF document, only numbers (with or without mask).",
                                example: "578.525.758-03"
                            },
                        }
                    }
                }
            }
        },
        responses:{
            200: return200,
            400: return400,
            404: return404,
            409: return409,
            500: return500,
        } 
    }
};

// usersRouter.get   ('/users/confirm-email/:id/:uniqueString', handleRegisterOrUpdateEmailConfirmation); 
//Not an API

// usersRouter.get   ('/users/user-message', handleEmailConfirmationVerified); 
//Not an API

// usersRouter.put   ('/users/update-user-email/:id',httpUpdateUserEmail);
const usersUpdateUserEmailSchema = {
    put: {
        tags: ["User"],
        summary: "Update user email",
        description: "Update the user email - it has its specific requirements and validations",
        parameters: [
            {
                name: "id",
                in: "path",
                description: "id of the user",
                type: "number",
                example: "5678",
            },
        ],
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
                        }
                    }
                }
            }
        },
        responses:{
            200: return200,
            400: return400,
            404: return404,
            409: return409,
            500: return500,
        } 
    }
};

// usersRouter.get   ('/users/forgot-password', httpRenderForgotPassword);
//Not an API

// usersRouter.post  ('/users/forgot-password', httpPostForgotPassword);
//Not an API

// usersRouter.get   ('/users/reset-password/:id/:uniqueString', handleForgotPasswordConfirmation); // httpResetPassword 
//Not an API

// usersRouter.post  ('/users/reset-password/:id/:uniqueString', httpPostResetPassword); // handleForgotPasswordConfirmation
//Not an API

// usersRouter.delete('/users/delete/:id', handleUserDelete); 

const userDeleteUserSchema = {
    delete: {
        tags: ["User"],
        summary: "Delete user",
        description: "Delete a specific user by id",
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
            200: return200,
            400: return400,
            404: return404,
            500: return500,
        } 
    }
};

export const userRouteDoc = {
    "/users/signin": usersSignInSchema,
    "/users/register": usersRegisterSchema,
    "/users": usersSchema,
    "/users/profile/{id}": usersByIdSchema,
    "/users/update-user/{id}": usersUpdateSchema,
    "/users/update-user-email/{id}": usersUpdateUserEmailSchema,
    "/users/delete/{id}": userDeleteUserSchema,
};