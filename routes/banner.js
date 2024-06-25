import express from "express";
const router = express.Router();
import {createBanner, getBannerList, getSingleBanner, updateBannerStatus, deleteBanner, updateBannerData} from "../controller/bannerController.js"
import { authentication } from "../middleware/authentication.js";
router.post("/", authentication, createBanner)
router.get("/", authentication, getBannerList)
router.get("/:bannerId", getSingleBanner);
router.put("/update/status/:bannerId", authentication, updateBannerStatus);
router.put("/delete/:bannerId", authentication, deleteBanner);
router.put("/update/:bannerId", authentication, updateBannerData);

export default router;