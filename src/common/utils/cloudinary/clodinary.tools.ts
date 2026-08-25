import { Injectable } from "@nestjs/common";
import cloudinary from "./cloudinary.service.js";

@Injectable()
export class CloudinaryTools {
    async uploadFile({ filePath, folder } = {filePath: "", folder: ""}) {
        try {
            const result = await cloudinary.uploader.upload(filePath, { folder });
            return result;
        } catch (error) {
            console.log(error);
        }
    }

    async uploadFiles({ files, folder } = {files:[], folder: ""}) {
        try {
            const coverPictures = await Promise.all(
                files.map(async (file) => {
                    const { public_id, secure_url } = await cloudinary.uploader.upload(
                        (file as any).path,
                        { folder },
                    );
                    return { public_id, secure_url };
                }),
            );
            return coverPictures;
        } catch (error) {
            console.log(error);
        }
    };

    async deleteFile(publicId: string) {
        try {
            const result = await cloudinary.uploader.destroy(publicId);
            return result;
        } catch (error) {
            console.log(error);
        }
    }

}



// export const uploadFile = async ({ filePath, folder } = {}) => {
//   try {
//     const result = await cloudinary.uploader.upload(filePath, { folder });
//     return result;
//   } catch (error) {
//     console.log(error);
//   }
// };

// export const uploadFiles = async ({ files, folder } = {}) => {
//   try {
//     const coverPictures = await Promise.all(
//       files.map(async (file) => {
//         const { public_id, secure_url } = await cloudinary.uploader.upload(
//           file.path,
//           { folder },
//         );
//         return { public_id, secure_url };
//       }),
//     );
//     return coverPictures;
//   } catch (error) {
//     console.log(error);
//   }
// };
