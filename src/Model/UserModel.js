const mongoose = require("mongoose");
const { ValidName, ValidEmail, ValidPassword } = require("../Validation/AllVallidatios");
const bcrypt = require('bcrypt');

const userSchema = new mongoose.Schema(
    {
        profile_image: {
            type: {
                url: { type: String, required: true, trim: true },
                public_id: { type: String, required: true, trim: true }
            }
        },
        name: {
            type: String,
            required: [true, "Name is required"],
            validate: [ValidName, "Name is not valid"],
            trim: true
        },
        email: {
            type: String,
            required: [true, "Email is required"],
            validate: [ValidEmail, "Email is not valid"],
            trim: true,
            lowercase: true
        },
        password: {
            type: String,
            required: [true, "Password is required"],
            validate: [ValidPassword, "Password is not valid"],
            trim: true
        },
        Verification: {
            user: {
                UserOTP: { type: String, default: null },
                isDeleted: { type: Boolean, default: false },
                isVerify: { type: Boolean, default: false },
                isOtpVerified: { type: String, default: 0 },
                expireOTP: { type: Date, default: null }

            },
            admin: {
                isAccountActive: { type: Boolean, default: true },
                AdminOTP: { type: String, default: null },
                isOtpVerified: { type: String, default: 0 },

            }
        },

        role: { type: String, enum: ['user', 'admin'], required: true, trim: true }
    },
    { timestamps: true }
);

userSchema.pre('save', async function (next) {

    try {
        this.password = await bcrypt.hash(this.password, 10);
        next();
    }
    catch (err) {
        next(err);
    }
});


// userSchema.methods.comparePassword = async function (candidatePassword) {
//     return bcrypt.compare(candidatePassword, this.password);
// };

module.exports = mongoose.model('User', userSchema);
