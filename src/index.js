const express = require('express')
const app = express()
const cors = require('cors')
require('./db/mongoose')
const userRouter = require('./routers/user')
const ipoRouter = require('./routers/ipo')
const port = process.env.PORT || 3000


app.use(express.json())
app.use(cors({
    // allowedHeaders:['*'],
    origin:'*'
}))
app.use(userRouter)
app.use(ipoRouter)

app.listen(port, () => {
    console.log(`Server is running on ${port}`);
})
