const jwt = require('jsonwebtoken')
const User = require('../models/users')
require('dotenv').config()

const jwtToken = process.env.JWT_TOKEN
const auth = async(req, res, next) => {
   try {
 
      const token = req.header('Authorization').replace('Bearer ', '')
      const decode = jwt.verify(token, jwtToken)
      const user =await User.findOne({ _id: decode._id, 'tokens.token': token })
      
      if (!user) {
         throw new Error('')
      }
      req.token =token
      req.user = user 
      next()
   } catch (error) {
      res.status(401).send("please authenticate.")
   }
}

module.exports = auth