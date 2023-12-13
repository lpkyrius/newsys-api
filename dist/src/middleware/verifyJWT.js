"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
require('dotenv').config();
const jwt = require('jsonwebtoken');
const verifyJWT = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    if (!authHeader)
        return res.sendStatus(401);
    const token = authHeader.split(' ')[1];
    jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, decoded) => {
        if (err)
            return res.sendStatus(403); // invalid token
        //req.user = decoded.username;
        next();
    });
};
exports.default = verifyJWT;
