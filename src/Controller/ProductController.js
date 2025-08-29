const ProductModel = require("../Model/ProjectModel");
const { uploadProduct, deleteProfileImg } = require('../Images/UploadImage');
const { errorHandlingdata } = require('../Error/ErrorHandling')


exports.CreateProduct = async(req,res)=>{
    try {
        
         const data = req.body;
        const file = req.file;

        if (!file) return res.status(400).send({ status: false, msg: "Please provide file" });

        const checktitle = await ProductModel.findOne({ title: data.title });
         
        if(checktitle){
        await deleteProfileImg(checktitle.productImg.public_id);
         data.productImg = await uploadProduct(file.path);
        }
        else{
            data.productImg = await uploadProduct(file.path);
        }

        
        const db= await ProductModel.create(data);
        res.status(201).send({ status: true, msg: "Product created successfully",data:db })

    } catch (error) {
        errorHandlingdata(error, res)
    }
}