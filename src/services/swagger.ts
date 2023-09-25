import { Express, Request, Response } from 'express';
import swaggerJsdoc from 'swagger-jsdoc';   // builds documentation
import swaggerUi from 'swagger-ui-express'; // exposes documentation
import {userRouteDoc} from "../routes/users/user.doc";

require('dotenv').config();

const options: swaggerJsdoc.options = {
    definition: {
        openapi: '3.1.0',
        servers: [
            {
                url: `${process.env.SERVER_ADDRESS || 'http://localhost'}:${process.env.PORT || 8000}`,
            }
        ],
        info: {
            title: 'REST API Docs',
            version: '1.0.0'
        },
        components:{
            securitySchemas:{
                bearerAuth:{
                    type: 'http',
                    scheme: 'bearer',
                    bearerFormat: 'JWT'
                }
            }
        },
        security:[
            {
                bearerAuth: [],
            }
        ],
        tags: [
            {
                name: "User",
                description: "User routes"
            }
        ],
        paths: userRouteDoc,
    },
    apis: ['../routes/users/users.router.js', '../routes/groups/groups.router.js']
}

const swaggerSpec = swaggerJsdoc(options);

function swaggerDocs(app: Express){

    // Swagger page
    app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

    // Docs in JSON format
    app.get('api-docs.json', (req: Request, res: Response) => {
        res.setHeader('Content-Type', 'application/json');
        res.send(swaggerSpec);
    });
}

export default swaggerDocs;