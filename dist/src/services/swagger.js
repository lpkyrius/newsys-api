"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const swagger_jsdoc_1 = __importDefault(require("swagger-jsdoc")); // builds documentation
const swagger_ui_express_1 = __importDefault(require("swagger-ui-express")); // exposes documentation
const user_doc_1 = require("../routes/users/user.doc");
require('dotenv').config();
const options = {
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
        components: {
            securitySchemas: {
                bearerAuth: {
                    type: 'http',
                    scheme: 'bearer',
                    bearerFormat: 'JWT'
                }
            }
        },
        security: [
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
        paths: user_doc_1.userRouteDoc,
    },
    apis: ['../routes/users/users.router.js', '../routes/groups/groups.router.js']
};
const swaggerSpec = (0, swagger_jsdoc_1.default)(options);
function swaggerDocs(app) {
    // Swagger page
    app.use('/api-docs', swagger_ui_express_1.default.serve, swagger_ui_express_1.default.setup(swaggerSpec));
    // Docs in JSON format
    app.get('api-docs.json', (req, res) => {
        res.setHeader('Content-Type', 'application/json');
        res.send(swaggerSpec);
    });
}
exports.default = swaggerDocs;
