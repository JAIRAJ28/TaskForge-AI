const jwt = require('jsonwebtoken');
require('dotenv').config();

const auth = async (req, res, next) => {
    const token = req.headers.authorization;
    console.log(token," req.headers.authorization",process.env.SECRET_KEY)
    try {
        if (token) {
            const tokenToVerify = token.startsWith("Bearer") ? token.split(" ")[1] : token;
            const decoded = jwt.verify(tokenToVerify, process.env.SECRET_KEY);
            if (decoded) {
                req.user = { name: decoded.name, userId: decoded.userId }; 
                next();
            } else {
                res.status(401).send({ msg: "Please Login first" });
            }
        } else {
            res.status(401).send({ msg: "No token provided" });
        }
    } catch (error) {
        // console.log(error)
        res.status(401).send({ msg: "Auth Middleware Error", error: error.message });
    }
};

module.exports = {
    auth
};
