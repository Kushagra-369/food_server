const ProductModel = require("../Model/ProjectModel");
const { uploadProduct, deleteProfileImg } = require('../Images/UploadImage');
const { errorHandlingdata } = require('../Error/ErrorHandling')


exports.CreateProduct = async (req, res) => {
  try {
    const data = req.body;
    const file = req.file;

    // parse JSON fields sent by frontend
    if (data.variants) data.variants = JSON.parse(data.variants);
    if (data.nutrition) data.nutrition = JSON.parse(data.nutrition);
    if (data.tags) data.tags = JSON.parse(data.tags);
    if (data.ingredients) data.ingredients = JSON.parse(data.ingredients);

    // map productName -> name
    if (data.productName) {
      data.name = data.productName.trim();   // normalize
      delete data.productName;
    }

    // ✅ Check if product with same name already exists
    const existingProduct = await ProductModel.findOne({ name: data.name });
    if (existingProduct) {
      return res.status(400).send({ 
        status: false, 
        msg: "Product with this name already exists" 
      });
    }

    // required by schema
    data.createdBy = req.params.id;

    // upload and set images array
    if (!file) return res.status(400).send({ status: false, msg: "Please provide file" });
    const uploaded = await uploadProduct(file.path); // returns { secure_url, public_id }
    data.images = [{ secure_url: uploaded.secure_url, public_id: uploaded.public_id }];

    // category must match enum case exactly (e.g., "Pizza")
    const saved = await ProductModel.create(data);
    res.status(201).send({ status: true, msg: "Product created successfully", data: saved });
  } catch (error) {
    errorHandlingdata(error, res);
  }
};

exports.GetAllProducts = async (req, res) => {
  try {
    const type = req.params.type;
    if (type === "All") {
      const allDB = await ProductModel.find().select({ createdAt: 0, updatedAt: 0, __v: 0 });
      if (!allDB || allDB.length === 0)
        return res.status(404).send({ status: false, msg: "No products found" });

      return res.status(200).send({ status: true, msg: "All products fetched successfully", data: allDB });
    } else {
      // check if it's a valid MongoDB ObjectId
      if (!mongoose.Types.ObjectId.isValid(type)) {
        return res.status(400).send({ status: false, msg: "Invalid product id" });
      }

      const product = await ProductModel.findById(type).select({ createdAt: 0, updatedAt: 0, __v: 0 });
      if (!product)
        return res.status(404).send({ status: false, msg: "No product found with this id" });

      return res.status(200).send({ status: true, msg: "Product fetched successfully", data: product });
    }
  } catch (error) {
    console.error("GetAllProducts error:", error); // 👈 add log
    errorHandlingdata(error, res);
  }
};
