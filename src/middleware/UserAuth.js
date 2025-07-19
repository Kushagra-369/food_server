const { errorHandlingdata } = require('../Error/ErrorHandling')
const jwt = require('jsonwebtoken')
exports.UserAuthenticate = (req, res, next) => {
    try {
        const token = req.headers["x-api-key"]

        console.log(req)
        console.log(token)
        if (!token) { return res.status(400).send({ status: false, msg: "Token must be present" }) }
        const decodedToken = jwt.verify(token, process.env.JWT_User_SECRET_KEY)
        req.user = decodedToken

        next()
    }
    catch (e) { errorHandlingdata(e, res) }

}

exports.UserAuthorize = (req, res, next) => {
    try {
        
        const jwtUserId = req.user.userId
        const id = req.params.id

        if(!id) return res.status(400).send({status:false,msg:"id must be present"})
        if(id != jwtUserId) return res.status(400).send({status:false,msg:"unauthorized user"})

        next()
    }
    catch (e) { errorHandlingdata(e, res) }

}