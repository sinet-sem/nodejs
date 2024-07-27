const jwt = require('jsonwebtoken');
const jwtSecret = "s1";

const generateToken = (user) => {
    return jwt.sign({ user }, jwtSecret, { expiresIn: '2h' });
}

const verifyToken = (token) => {
    return jwt.verify(token, jwtSecret);
}

module.exports = {
    generateToken,
    verifyToken
}