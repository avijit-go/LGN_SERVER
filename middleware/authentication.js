import jwt from "jsonwebtoken";
import { createError } from "../error.js";

export const authentication = async(req, res, next) => {
    try {
        const token = req.headers['x-access-token'];
        if(!token) {
              return next(createError(422, "Token is not present"));
        } 
        const verify = await jwt.verify(token, process.env.JWT_SECRET);
        req.user = verify;
        next();
    }
    catch(error) {
        next(error)
    }
}