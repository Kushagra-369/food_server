const { errorHandlingdata } = require('../Error/ErrorHandling')
const jwt = require('jsonwebtoken')
exports.authenticate = (req, res, next) => {
    try {
        const token = req.headers["x-api-key"]

        console.log(req)
        console.log(token)
        if (!token) { return res.status(400).send({ status: false, msg: "Token must be present" }) }
        const decodedToken = jwt.verify(token, process.env.JWT_Admin_SECRET_KEY)

        next()
    }
    catch (e) { errorHandlingdata(e, res) }

}

exports.AdminAuthorize = (req, res, next) => {
    try {
        const { userId, role } = req.user;  // decoded from JWT
        const id = req.params.id;

        if (!id) {
            return res.status(400).send({ status: false, msg: "id must be present" });
        }

        // Allow admin to bypass id check
        if (role === "admin") {
            return next();
        }

        // For normal users, enforce self-access only
        if (id != userId) {
            return res.status(403).send({ status: false, msg: "unauthorized user" });
        }

        next();
    } catch (e) {
        errorHandlingdata(e, res);
    }
};
