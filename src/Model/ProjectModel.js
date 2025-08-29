const mongoose = require("mongoose");

const productSchema = new mongoose.Schema(
    {
        name: {type: String,required: [true, "Product name is required"],trim: true,minlength: [2, "Product name must be at least 2 characters"],maxlength: [100, "Product name must be less than 100 characters"]},
        description: {type: String,required: [true, "Description is required"],trim: true,maxlength: [2000, "Description must be less than 2000 characters"]},
        images: [
            {
                secure_url: { type: String, required: true, trim: true },
                public_id: { type: String, required: true, trim: true }
            }
        ],
        price: {type: Number,required: [true, "Price is required"],min: [0, "Price cannot be negative"]},
        discount: {type: Number,default: 0,min: [0, "Discount cannot be negative"],max: [100, "Discount cannot exceed 100%"]},
        category: {type: String,required: [true, "Category is required"],enum: ["Pizza", "Burger", "Pasta", "Drinks", "Dessert", "Indian" ],trim: true},
        subCategory: {type: String,trim: true}, // Example: "Veg Pizza", "Non-Veg Burger"
        tags: {type: [String],default: [],trim: true},
        variants: [
            {
                size: { type: String, enum: ["Small", "Medium", "Large"], trim: true },
                extraPrice: { type: Number, default: 0, min: 0 }
            }
        ],
        ingredients: {type: [String],default: []}, // Example: ["Cheese", "Tomato Sauce", "Olives"]
        nutrition: {calories: { type: Number, default: 0 },protein: { type: Number, default: 0 },carbs: { type: Number, default: 0 },fat: { type: Number, default: 0 }},
        preparationTime: {type: Number, default: 15},
        stock: {type: Number,required: [true, "Stock is required"],min: [0, "Stock cannot be negative"]},
        isAvailable: {type: Boolean,default: true},
        ratings: {average: { type: Number, default: 0, min: 0, max: 5 },count: { type: Number, default: 0, min: 0 }},
        reviews: [
            {
                user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
                comment: { type: String, trim: true },
                rating: { type: Number, min: 1, max: 5, required: true },
                createdAt: { type: Date, default: Date.now }
            }
        ],
        createdBy: {type: mongoose.Schema.Types.ObjectId,ref: "User",required: true},
        status: {type: String,enum: ["Draft", "Published", "Archived"],default: "Published"}
    },
    { timestamps: true }
);

module.exports = mongoose.model("Product", productSchema);

// is deleted , 