import jwt from 'jsonwebtoken';
import { createError } from './error.js';

export const varifyToken = (req, res, next) => {
    let token;

    // Check if token is in the body
    if (req.body && req.body.token) {
        token = req.body.token;
    }

    // If token is not in the body, check the Authorization header
    if (!token && req.headers.authorization) {
        const authHeader = req.headers.authorization;
        if (authHeader.startsWith('Bearer ')) {
            token = authHeader.split(' ')[1];
        }
    }

    // If no token is found, return an error
    if (!token) {
        return next(createError(401, 'You are not authenticated'));
    }

    // Verify the token
    jwt.verify(token, process.env.JWT_SECRET, (err, data) => {
        if (err) return next(createError(403, "Token is not valid!"));
        req.data = data;
        next();
    });
};