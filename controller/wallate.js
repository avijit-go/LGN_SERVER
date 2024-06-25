import { createError } from "../error.js";
import wallet from "../models/wallet.js";

export const getWallate = async (req,res,next) => {
    const {userId} = req.params;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    try {
        if (!userId || userId === "") {
            return next(createError(422, "UserId required"));

        }
        const allWallate = await wallet.find({ user: userId })
        .skip(limit * (page - 1))
        .limit(limit)
        .sort({ createdAt: -1 });

        res.status(200).json({message: "sucsess", allWallate});
    } catch (error) {
       console.log(error);
        return next(createError(500,"Something went wrong"));
    }
}