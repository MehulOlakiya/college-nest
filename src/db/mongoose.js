const mongoose = require('mongoose')
require('dotenv').config()

const mongoUrl=process.env.MONGODB_URL
mongoose.set('strictQuery', true);
mongoose.connect(mongoUrl, {
    useNewUrlParser: true,
    
}).then(() => console.log( 'Database Connected' ))
.catch(err => console.log( err ));



 