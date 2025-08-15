const UserModel = require("../Model/UserModel");
const { otpVerificationUser, changeEmail } = require("../Mail/UserMail")
const { errorHandlingdata } = require('../Error/ErrorHandling')
const jwt = require('jsonwebtoken')
const bcrypt = require('bcrypt');
const { UploadProfileImg, DeleteProfileImg } = require("../Images/UploadImage")
const dotenv = require("dotenv")
dotenv.config()

exports.createuser = async (req, res) => {
    try {
        const data = req.body;

        if (Object.keys(data).length === 0) { return res.status(400).send({ status: false, msg: "A value is required in this field." }); }

        const randomOTP = Math.floor(1000 + Math.random() * 9000)

        const Verification = {}
        Verification.user = {}
        const expireOTPAt = new Date(Date.now() + 5 * 60 * 1000);

        const CheckUser = await UserModel.findOneAndUpdate(
            { email: data.email },
            {
                $set: {
                    "Verification.user.UserOTP": randomOTP,
                    "Verification.user.expireOTP": expireOTPAt
                }
            },
            { new: true }
        );
        if (CheckUser) {
            console.log(CheckUser);
            const DBDATABASE = { name: CheckUser.name, email: CheckUser.email, _id: CheckUser._id }

            const userVerification = CheckUser.Verification?.user || {};
            const adminVerification = CheckUser.Verification?.admin || {};

            const { isDeleted, isVerify, isAccountActive } = Verification
            if (userVerification.isDeleted) return res.status(400).send({ status: false, msg: 'User already deleted' });
            if (userVerification.isVerify) return res.status(400).send({ status: false, msg: 'Account already verified, please login' });
            if (!adminVerification.isAccountActive) return res.status(400).send({ status: false, msg: 'User is blocked by admin' });

            otpVerificationUser(CheckUser.name, CheckUser.email, randomOTP);
            return res.status(200).send({ status: true, msg: 'OTP sent successfully', data: DBDATABASE });

        }

        data.role = 'user';
        data.Verification = {
            user: {
                UserOTP: randomOTP,
                expireOTP: expireOTPAt,
            },
        };


        const newUser = await UserModel.create(data);

        const newDB = { name: newUser.name, email: newUser.email, _id: newUser._id }

        return res.status(201).send({ status: true, msg: 'User created successfully', data: newDB });

    } catch (e) {
        return res.status(500).send({
            status: false,
            msg: e.message
        });
    }
};

exports.UserOtpVerify = async (req, res) => {
    try {

        const otp = req.body.otp;
        const id = req.params.id;

        if (!otp) return res.status(400).send({ status: true, msg: "pls Provide OTP" });

        const user = await UserModel.findById(id);
        if (!user) return res.status(400).send({ status: true, msg: "User not found" });
        const dbOtp = user.Verification.user.UserOTP;
        console.log(dbOtp, otp);
        if (!(dbOtp == otp)) return res.status(400).send({ status: true, msg: "Wrong otp" });

        await UserModel.findByIdAndUpdate(
            { _id: id },
            { $set: { 'Verification.user.isVerify': true } },
            { new: true }
        );
        res.status(200).send({ status: true, msg: "User Verify successfully" });

    }
    catch (e) { errorHandlingdata(e, res) }
}

exports.LogInUser = async (req, res) => {
    try {

        const data = req.body
        const { email, password } = data

        const CheckUser = await UserModel.findOne({ email: email, role: "user" })

        if (!CheckUser) return res.status(400).send({ status: false, msg: "User Not Found" })

        const userVerification = CheckUser.Verification?.user || {};
        const adminVerification = CheckUser.Verification?.admin || {};

        const comparePass = await bcrypt.compare(password, CheckUser.password)

        if (!comparePass) return res.status(400).send({ status: false, msg: "Wrong Password" })

        if (CheckUser) {
            console.log(CheckUser);
            const DBDATABASE = { name: CheckUser.name, email: CheckUser.email, _id: CheckUser._id }

            const userVerification = CheckUser.Verification?.user || {};
            const adminVerification = CheckUser.Verification?.admin || {};

            const { isDeleted, isVerify, isAccountActive } = userVerification
            if (userVerification.isDeleted) return res.status(400).send({ status: false, msg: 'User already deleted' });
            if (!userVerification.isVerify) return res.status(400).send({ status: false, msg: ' please verify your OTP' });
            if (!adminVerification.isAccountActive) return res.status(400).send({ status: false, msg: 'User is blocked by admin' });
        }

        const DBDATA = { profileIMG: CheckUser.profileIMG, name: CheckUser.name, email: CheckUser.email }

        const token = jwt.sign({ userId: CheckUser._id }, process.env.JWT_User_SECRET_KEY, { expiresIn: '24h' })
        return res.status(200).send({ status: true, msg: "Login Successfully", data: { token, id: CheckUser._id, DBDATA } })
    }

    catch (e) {
        errorHandlingdata(e, res)
    }

}

exports.getUserById = async (req, res) => {
    try {

        const id = req.params.id

        const DB = await UserModel.findById(id)

        if (!DB) return res.status(400).send({ status: false, msg: 'Data Not Found' })
        return res.status(200).send({ status: true, data: DB })
    }
    catch (e) { res.status(500).send({ status: false, msg: e.message }) }
}

exports.ResendOTP = async (req, res) => {
    try {
        const id = req.params.id;
        const user = await UserModel.findById(id);
        if (!user) return res.status(400).send({ status: false, msg: "User not found" });

        const randomOTP = Math.floor(1000 + Math.random() * 9000);

        const updatedUser = await UserModel.findByIdAndUpdate(
            id,
            { $set: { 'verification.user.userOTP': randomOTP } },
            { new: true }
        );

        if (!updatedUser) {
            return res.status(500).send({ status: false, msg: "Failed to update OTP" });
        }

        otpVerificationUser(updatedUser.name, updatedUser.email, randomOTP);

        res.status(200).send({ status: true, msg: "OTP sent successfully" });
    } catch (e) {
        console.error(e);
        errorHandlingdata(e, res);
    }
};


exports.userDelete = async (req, res) => {
    try {
        const id = req.params.id;
        const user = await UserModel.findById(id);
        if (!user) return res.status(404).send({ status: false, msg: "User not found" });

        const randomOTP = Math.floor(1000 + Math.random() * 9000);

        const updatedUser = await UserModel.findByIdAndUpdate(
            id,
            { $set: { 'Verification.user.isDeleted': true } },
            { new: true }
        );



        if (!updatedUser) {
            return res.status(500).send({ status: false, msg: "Failed to delete user" });
        }

        // Debug: check if field is updated
        console.log("isDeleted:", updatedUser.Verification?.user?.isDeleted);

        otpVerificationUser(updatedUser.name, updatedUser.email, randomOTP);

        res.status(200).send({ status: true, msg: "Account deleted successfully" });
    } catch (e) {
        console.error(e);
        errorHandlingdata(e, res);
    }
};

exports.userUpdated = async (req, res) => {
    try {
        const id = req.params.id;
        const randomOTP = Math.floor(1000 + Math.random() * 9000);

        const data = req.body
        const { name } = data

        const user = await UserModel.findById(id);
        if (!user) return res.status(404).send({ status: false, msg: "User not found" });


        const DB = await UserModel.findByIdAndUpdate(
            id,
            { $set: { name } },
            { new: true }
        );

        if (!DB) {
            return res.status(500).send({ status: false, msg: "Failed to update user" });
        }

        const DBDATA = {
            name: DB.name,
            email: DB.email,
            _id: DB._id
        };

        console.log("isUpdated:", DB.Verification?.user?.isUpdated);

        otpVerificationUser(DB.name, DB.email, randomOTP);


        res.status(200).send({ status: true, msg: "Account updated successfully", data: DBDATA });
    } catch (e) {
        console.error(e);
        errorHandlingdata(e, res);
    }
};

exports.changePassword = async (req, res) => {
    try {
        const id = req.params.id;
        const data = req.body

        const { currentPassword, newPassword } = data

        if (currentPassword == newPassword) return res.status(400).send({ status: false, msg: "not provide same password " })


        const randomOTP = Math.floor(1000 + Math.random() * 9000);



        const user = await UserModel.findById(id);
        if (!user) return res.status(404).send({ status: false, msg: "User not found" });

        const bcryptPass = await bcrypt.compare(currentPassword, user.password);
        if (!bcryptPass) return res.status(400).send({ status: false, msg: "Wrong Password" })

        const hashPassword = await bcrypt.hash(newPassword, 10);

        await UserModel.findByIdAndUpdate({ _id: id }, { $set: { password: hashPassword } })

        res.status(200).send({ status: true, msg: "Password updated successfully" });
    } catch (e) {
        console.error(e);
        errorHandlingdata(e, res);
    }
};

exports.UploadProfileImg = async (req, res) => {
    try {
        const id = req.params.id;
        const file = req.file;
        console.log(file);

        if (!file) return res.status(400).send({ status: false, msg: "Please Provide File" });

        const CheckUser = await UserModel.findById(id);
        if (!CheckUser) return res.status(400).send({ status: false, msg: "User not Found" });

        // Delete previous image if exists
        if (CheckUser.profileIMG) {
            await DeleteProfileImg(CheckUser.profileIMG.public_id);
        }

        // Upload new image
        const imgURL = await UploadProfileImg(file.path);

        const updatedUser = await UserModel.findByIdAndUpdate(
            id,
            { $set: { profileIMG: imgURL } },
            { new: true }
        );

        const DB = {
            _id: updatedUser._id,
            name: updatedUser.name,
            email: updatedUser.email,
            profileIMG: updatedUser.profileIMG
        };

        res.status(200).send({ status: true, msg: "Profile Updated successfully", data: DB });
    } catch (e) {
        errorHandlingdata(e, res);
    }
}

exports.newEmail = async (req, res) => {
    try {
        const { id } = req.params;
        const { password, newEmail } = req.body;

        if (!id || !password || !newEmail) {
            return res.status(400).send({ status: false, msg: "Missing required fields" });
        }

        // Find the user by ID
        const user = await UserModel.findById(id);
        if (!user) return res.status(404).send({ status: false, msg: "User not found" });

        // Check if new email is already in use
        const emailExists = await UserModel.findOne({ email: newEmail, role: 'user' });
        if (emailExists) {
            return res.status(400).send({ status: false, msg: "Email already registered" });
        }

        // Check password
        const isPasswordCorrect = await bcrypt.compare(password, user.password);
        if (!isPasswordCorrect) {
            return res.status(400).send({ status: false, msg: "Wrong password" });
        }

        // Account status checks
        const userVerification = user.Verification?.user || {};
        const adminVerification = user.Verification?.admin || {};

        if (userVerification.isDeleted) {
            return res.status(400).send({ status: false, msg: "User already deleted" });
        }

        if (!adminVerification?.isAccountActive) {
            return res.status(400).send({ status: false, msg: "User is blocked by admin" });
        }

        // Generate OTP and expiry time
        const randomOTP = Math.floor(1000 + Math.random() * 9000);
        const expireOTPAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes validity

        // Update user document with new email OTP info
        await UserModel.findByIdAndUpdate(
            id,
            {
                $set: {
                    "Verification.email.newEmail": newEmail,
                    "Verification.email.UserOTP": randomOTP,
                    "Verification.email.expireOTP": expireOTPAt
                }
            },
            { new: true }
        );

        // Send email with OTP
        changeEmail(user.name, newEmail, randomOTP);

        return res.status(200).send({ status: true, msg: "OTP sent to new email successfully" });

    } catch (e) {
        errorHandlingdata(e, res);
    }
};

exports.newEmailVerify = async (req, res) => {
    try {
        const data = req.body
        const otp = req.body.otp;
        const id = req.params.id;
        console.log(otp, id)

        const randomOTP = Math.floor(1000 + Math.random() * 9000)

        const UpdateOTP = await UserModel.findOneAndUpdate(
            { email: data.email, 'Verification.user.isDeleted': false, 'Verification.admin.isAccountActive': true },
            {
                $set: {
                    "Verification.user.UserOTP": randomOTP,
                    // "Verification.user.expireOTP": expireOTPAt
                }
            },
            { new: true }
        );

        const CheckId = await UserModel.findById(id);
        if (!CheckId) return res.status(400).send({ status: false, msg: "User not found" });

        const nowTime = Math.floor((Date.now()) / 1000);
        const DBTime = CheckId.Verification.email.expireTime

        if (nowTime >= DBTime) return res.status(400).send({ status: false, msg: "OTP Expired" });

        if (otp == CheckId.Verification.email.UserOTP) {
            await UserModel.findByIdAndUpdate({ _id: id },
                { $set: { email: CheckId.Verification.email.newEmail, 'Verification.email.UserOTP': randomOTP } });
            res.status(200).send({ status: true, msg: "Email Verify successfully" });
        }
        else {
            res.status(400).send({ status: false, msg: "Wrong OTP" });
        }


    }
    catch (e) { errorHandlingdata(e, res) }
}