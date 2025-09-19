const ProductModel = require("../Model/ProjectModel");
const { uploadProduct, deleteProfileImg } = require('../Images/UploadImage');
const { errorHandlingdata } = require('../Error/ErrorHandling')

exports.CreateProduct = async (req, res) => {
  try {
    const data = req.body;
    const file = req.file;

    // parse JSON fields sent by frontend
if (data.variants !== undefined) data.variants = JSON.parse(data.variants);
if (data.nutrition !== undefined) data.nutrition = JSON.parse(data.nutrition);
if (data.tags !== undefined) data.tags = JSON.parse(data.tags);
if (data.ingredients !== undefined) data.ingredients = JSON.parse(data.ingredients);


    // map productName -> name
    if (data.productName) {
      data.name = data.productName.trim();   // normalize
      delete data.productName;
    }

    // ✅ Check if product with same name already exists
const role = data.role || 'admin'; // or 'user' in CreateUserProduct
const existingProduct = await ProductModel.findOne({ name: data.name, role });
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


exports.CreateUserProduct = async (req, res) => {
  try {
    const data = req.body;

    // Parse ingredients safely
    if (data.ingredients) {
      try { data.ingredients = JSON.parse(data.ingredients) } 
      catch (e) { data.ingredients = [] }
    } else data.ingredients = [];

    // Parse nutrition safely
    if (data.nutrition) {
      try { data.nutrition = JSON.parse(data.nutrition) } 
      catch (e) { data.nutrition = { calories:0, protein:0, carbs:0, fat:0 } }
    } else data.nutrition = { calories:0, protein:0, carbs:0, fat:0 };

    // Ensure product name
    if (!data.name) return res.status(400).send({ status: false, msg: "Product name is required" });
    data.name = data.name.trim();
    delete data.productName;

    // Fix category to match enum
    if (data.category) data.category = data.category.toLowerCase();
    else data.category = "burger"; // default

    // Add defaults for required fields
    data.stock = data.stock || 0;
    data.price = data.price || 0;
    data.mode = data.mode || "Online";
    data.images = [];

    data.createdBy = req.params.id;
    data.role = "user";

const role = data.role || 'admin'; // or 'user' in CreateUserProduct
const existingProduct = await ProductModel.findOne({ name: data.name, role });
    if (existingProduct) 
      return res.status(400).send({ status: false, msg: "Product already exists" });

    const saved = await ProductModel.create(data);
    res.status(201).send({ status: true, msg: "Product created successfully", data: saved });

  } catch (error) {
    console.error(error);
    errorHandlingdata(error, res);
  }
};



exports.GetAllProducts = async (req, res) => {
  try {
    const type = req.params.type;
    const role = req.query.role; // optional query param ?role=admin or ?role=user

    let query = {};
    if (role) query.role = role; // filter by role if provided

    if (type === "All") {
      const allDB = await ProductModel.find(query).select({ createdAt: 0, updatedAt: 0, __v: 0 });
      if (!allDB || allDB.length === 0)
        return res.status(404).send({ status: false, msg: "No products found" });

      return res.status(200).send({ status: true, msg: "All products fetched successfully", data: allDB });
    } else {
      // check if it's a valid MongoDB ObjectId
      if (!mongoose.Types.ObjectId.isValid(type)) {
        return res.status(400).send({ status: false, msg: "Invalid product id" });
      }

      const product = await ProductModel.findOne({ _id: type, ...query }).select({ createdAt: 0, updatedAt: 0, __v: 0 });
      if (!product)
        return res.status(404).send({ status: false, msg: "No product found with this id" });

      return res.status(200).send({ status: true, msg: "Product fetched successfully", data: product });
    }
  } catch (error) {
    console.error("GetAllProducts error:", error);
    errorHandlingdata(error, res);
  }
};


exports.GetByCategory = async (req, res) => {
  try {
    const category = req.params.category;

    console.log(category) 
      const allDB = await ProductModel.find({ category: category }).select({ createdAt: 0, updatedAt: 0, __v: 0 });
      if (!allDB || allDB.length === 0)
        return res.status(404).send({ status: false, msg: "No products found" });

      return res.status(200).send({ status: true, msg: "All products fetched successfully", data: allDB });
  
  } catch (error) {
    console.error("GetByCategory error:", error); // 👈 add log
    errorHandlingdata(error, res);
  }
}; 
