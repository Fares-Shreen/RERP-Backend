import { v2 as cloudinary } from "cloudinary";

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME || "dvbtwsufm",
    api_key: process.env.CLOUDINARY_API_KEY || "237339868158799",
    api_secret: process.env.CLOUDINARY_API_SECRET || "efYszDL3htKYrQpbi06AEptsJK8",
});

export default cloudinary;
// CLOUD_NAME = "dvbtwsufm",
//     API_KEY = "237339868158799",
//     API_SECRET = "efYszDL3htKYrQpbi06AEptsJK8",