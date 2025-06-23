const UserModel = require("../Model/UserModel");

exports.createuser = async (req, res) => {
    try {
        const data = req.body;

         const validationRules = {
            name: { required: true, regex: /^[A-Za-z ]+$/, errorMsg: 'Invalid Name!' },
            email: { required: true, regex: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/, errorMsg: 'Invalid Email!' },
            password: { required: true, regex: /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d@$!%*?&]{8,}$/, errorMsg: 'Invalid Password!' }
        };


        for (const [key, value] of Object.entries(data)) {
            if (validationRules[key].required && !value) {
                return res.status(400).send({ status: false, msg: validationRules[key].errorMsg });
            }
            if (validationRules[key].regex && !validationRules[key].regex.test(value)) {
                return res.status(400).send({ status: false, msg: validationRules[key].errorMsg });
            }
        }

        if (Object.keys(data).length === 0) {
            return res.status(400).send({
                status: false,
                msg: "Cannot provide empty field" 
            });
        }

        const { name, email, password } = data;

        if (!name) {
            return res.status(400).send({
                status: false,
                msg: "Please provide the name"
            });
        }

        if (!email) {
            return res.status(400).send({
                status: false,
                msg: "Please provide the email"
            });
        }

        if (!password) {
            return res.status(400).send({
                status: false,
                msg: "Please provide the password"
            });
        }

        const DB = await UserModel.create(data);

        return res.status(200).send({
            status: true,
            msg: `Hello ${name}`,
            data: DB
        });
    } catch (e) {
        return res.status(500).send({
            status: false,
            msg: e.message
        });
    }
};

exports.getAllData = async (req, res) => {
    try {

        const DB = await UserModel.find() 

        res.status(200).send({ status: true, data: DB })
    }
    catch (e) { res.status(500).send({ status: false, msg: e.message }) }
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