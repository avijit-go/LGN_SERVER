import { createError } from "../error.js";
import supportTickit from "../models/supportTickit.js";


export const createSupportTickit = async (req, res, next) => {
    try {
        const {name,email,subject,message} = req.body;
        if (name === "" || !name) {
            return next(createError(422,"Provide a name"));
        }
        if (email === "" || !email) {
            return next(createError(422, "Provide a email"));
        }
        if (subject === "" || !subject)  {
            return next(createError(422,"Provide a subject"));
        }
        if (message === "" || !message) {
            return next(createError(422, "Provide a message"));
        }

        const newTickit = new supportTickit({...req.body});
        await newTickit.save();
        const{_id, ...others} = newTickit._doc; 
        res.status(200).json({success: true, message: "Support tickit created successfully", tickitId: _id, tickitDetails: others});

    } catch (error) {
        console.log(error);
        return next(createError(500, "Something went wrong"));
    }
}

export const getSupportTickit = async (req, res, next)=> {
    try {
       const data = await  supportTickit.find({}).sort({createdAt: -1});
       return res.status(200).json({status: 200, data})
    } catch (error) {
        next(error)
    }
}