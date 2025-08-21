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

        const AdminDB = {
            profileIMG: user.profileIMG, name: user.name, email: user.email
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
        })

    } catch (e) {
        errorHandlingdata(e, res);
    }
};

exports.getAllUserData = async (req, res) => {
    try {

        const type = req.params.type
        const isDeleted = req.params.isDeleted
        if (type == 'all') {
            if (isDeleted == 'true') {
                const DB = await UserModel.find({ role: 'user', 'Verification.user.isDeleted': true })
                if (DB.length == 0) return res.status(400).send({ status: false, msg: "Data not Found" })
                if (!DB) return res.status(400).send({ status: false, msg: "Data not Found" })
                return res.status(200).send({ status: true, msg: "Successfully Got All User Data", data: DB })
            }
            else {
                const DB = await UserModel.find({ role: 'user', 'Verification.user.isDeleted': false })
                if (!DB) return res.status(400).send({ status: false, msg: "Data not Found" })
                return res.status(200).send({ status: true, msg: "Successfully Got All User Data", data: DB })
            }
        } else {
            const DB = await UserModel.findById(type)
            if (!DB) return res.status(400).send({ status: false, msg: "Data not Found" })
            return res.status(200).send({ status: true, msg: "Succesfully User Data", data: DB })
        }
    }
    catch (e) {
        errorHandlingdata(e, res)
    }
}

exports.AdminOtpVerify = async (req, res) => {
    try {
        const otp = req.body.otp;
        const id = req.params.id;

        if (!otp) {
            return res.status(400).send({ status: false, msg: "Please provide OTP" });
        }

        const user = await UserModel.findById(id);
        if (!user || user.role !== "admin") {
            return res.status(404).send({ status: false, msg: "Admin user not found" });
        }

        const dbOtp = user.Verification?.admin?.AdminOTP?.toString();
        const otpExpiry = user.Verification?.admin?.expireOTP;

        if (!dbOtp || dbOtp !== otp.toString()) {
            return res.status(400).send({ status: false, msg: "Incorrect OTP" });
        }

        if (!otpExpiry || new Date() > new Date(otpExpiry)) {
            return res.status(400).send({ status: false, msg: "OTP has expired" });
        }

        await UserModel.findByIdAndUpdate(
            id,
            {
                $set: {
                    'Verification.admin.isOtpVerified': "1" 
                }
            },
            { new: true }
        );

        return res.status(200).send({ status: true, msg: "Admin verified successfully" });

    } catch (e) {
        errorHandlingdata(e, res);
    }
};

