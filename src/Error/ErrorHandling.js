exports.errorHandlingdata = (err, res) => {

    if (err.name == "TypeError" || err.name == "ValidationError") {
        return res.status(400).send({ status: false, msg: err.message });
    }
    if (err.name == "JsonWebTokenError") {
        return res.status(400).send({ status: false, msg: "JWT Invalid Signature" });
    }
    if (err.name == "SyntaxError") {
        return res.status(400).send({ status: false, msg: err.message });
    }
    if (err.name == "CastError") {
        return res.status(400).send({ status: false, msg: "MongoDb id is not valid" });
    }
    if (err.code == 11000) {
        return res.status(400).send({ status: false, msg: `Duplicate value provided at ${Object.keys(err.keyValue)} ${Object.values(err.keyValue)}` });
    }
    return res.status(500).send({ status: false, msg: err.message })
}