const jwt = require('jsonwebtoken')
const User = require('../models/user')

const auth = async (req, res, next) => {
    try {
        const token = req.header('Authorization').replace('Bearer ', '')
        const decoded = jwt.verify(token, process.env.secret)
        const user = await User.findOne({where: {
            email:decoded.email,
            tokens:token         
        }, attributes: ['id', 'name', 'email','phone', 'country']})

       if (!user) {
           throw Error('Authentication failed')
       }
       profile = user
       auth_token = token
       next()
       
    }  catch(e) {
        console.log(e)
        res.status(401).send(`Couldn't authenticate`)
    }
}

module.exports = auth