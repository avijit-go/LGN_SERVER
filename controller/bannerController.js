import Banner from "../models/banner.js";
import { uploadImage } from "../helper/helper.js";
import mongoose from "mongoose";
import { createError } from "../error.js";

export const createBanner = async(req, res, next) => {
    try {
       /* Upload image */
       const imageUrl = await uploadImage(req.files.image);
       const newBanner = Banner({
        _id: new mongoose.Types.ObjectId(),
        name: req.body.name,
        image: imageUrl.url,
        link: req.body.link
       });
       const bannerData = await newBanner.save();
       return res.status(200).json({message: "New banner has been created", status: 201, banner: bannerData})
    } catch (error) {
        next(error)
    }
}

export const getBannerList = async(req, res, next) => {
    try {
       const page = req.query.page || 1;
       const limit = req.query.limit || 10;
       const list = await Banner.find({isDelete: false}).skip(limit * (page-1)).limit(limit).sort({createdAt: -1});
       return res.status(200).json({message: "List of banners", status: 200, data: list})
    } catch (error) {
        next(error)
    }
}

export const getSingleBanner = async(req, res, next) => {
    try {
        if(!req.params.bannerId) {
            return next(createError(422, "Banner id is not present"));
        }
        const bannerData = await Banner.findById(req.params.bannerId);
        return res.status(200).json({message: "Get single banner data", status: 200, data: bannerData})
    } catch (error) {
       next(error) 
    }
}

export const updateBannerStatus = async(req, res, next) => {
    try {
        if(!req.params.bannerId) {
            return next(createError(422, "Banner id is not present"));
        }
        const bannerData = await Banner.findByIdAndUpdate(req.params.bannerId, {$set: {status: req.body.status}}, {new: true});
        return res.status(200).json({message: "Banner status has been updated", status: 200, data: bannerData})
    } catch (error) {
       next(error) 
    }
}

export const deleteBanner = async(req, res, next) => {
    try {
       if(!req.params.bannerId) {
        return next(createError(422, "Banner id is not present"));
       }
       const updateBanner = await Banner.findByIdAndUpdate(req.params.bannerId, {$set: {isDelete: true}}, {new: true});
       return res.status(200).json({message: "Banner has been deleted", status: 200, data: updateBanner})
    } catch (error) {
       next(error) 
    }
}

export const updateBannerData = async(req, res, next) => {
    try {
       if(!req.params.bannerId) {
        return next(createError(422, "Banner id is not present"));
       }
       // const imageUrl = await uploadImage(req.files.image);
    //    var imageUrl;
    //    if(!req.files) {
    //     imageUrl = await uploadImage(req.files.image);
    //    }
       const updateBanner = await Banner.findByIdAndUpdate(req.params.bannerId, {$set: {name: req.body.name, link: req.body.link}}, {new: true});
       return res.status(200).json({message: "Banner has been deleted", status: 200, data: updateBanner})
    } catch (error) {
       next(error) 
    }
}