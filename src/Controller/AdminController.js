const UserModel = require("../Model/UserModel");
const { otpVerificationAdmin } = require("../Mail/UserMail")
const { errorHandlingdata } = require('../Error/ErrorHandling')
const jwt = require('jsonwebtoken')
const bcrypt = require('bcrypt');
const dotenv = require("dotenv")
dotenv.config()


exports.LogInAdmin = async (req, res) => {
    try {
        const { email, password } = req.body;

        // 1. Find admin user
        const user = await UserModel.findOne({ email, role: "admin" });
        if (!user) {
            return res.status(400).send({ status: false, msg: "Admin user not found" });
        }

        // 2. Validate password
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).send({ status: false, msg: "Incorrect password" });
        }

        // 3. Generate OTP & expiration
        const otp = Math.floor(1000 + Math.random() * 9000); // 4-digit OTP
        const otpExpiry = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes

        // 4. Save OTP in admin section of Verification
        await UserModel.updateOne(
            { email, role: "admin" },
            {
                $set: {
                    "Verification.admin.AdminOTP": otp,
                    "Verification.admin.expireOTP": otpExpiry
                }
            }
        );

        // 5. Send OTP via email
        await otpVerificationAdmin(user.name, user.email, otp);

        // 6. Create JWT token for further steps
        const token = jwt.sign(
            { userId: user._id },
            process.env.JWT_Admin_SECRET_KEY,
            { expiresIn: "24h" }
        );

        return res.status(200).send({
            status: true,
            msg: "Login successful. OTP has been sent to your email.",
            data: {
                token,
                id: user._id
            }
        });

    } catch (err) {
        console.error("Admin Login Error:", err);
        errorHandlingdata(err, res);
    }
};
