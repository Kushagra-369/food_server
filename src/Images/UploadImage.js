const cloudinary = require("cloudinary").v2
const dotenv = require("dotenv")
dotenv.config()

cloudinary.config({
    cloud_name: process.env.Cloud_name,
    api_key: process.env.API_key,
    api_secret: process.env.API_secret
});

exports.UploadProfileImg = async (file) => {
    try {
        console.log(file);
        const uploadResult = await cloudinary.uploader.upload(file)

        return {secure_url:uploadResult.secure_url , public_id:uploadResult.public_id}

    }
    catch (err) { console.log(err) }
}

exports.DeleteProfileImg = async (id) => {
    try {

        await cloudinary.uploader.destroy(id)

        return {secure_url:uploadResult.secure_url , public_id:uploadResult.public_id}

    }
    catch (err) { console.log(err) }
}