const express = require('express')
require('./db/mongoose')
const userRouter = require('./routers/user')
const taskRouter = require('./routers/task')

const app = express()
const port = process.env.PORT || 3000

app.use(express.json())
app.use(userRouter)
app.use(taskRouter)

app.listen(port, () => {
    console.log('Server is up on port ' + port)
})


/* bcrypt example ------------------ */

/* 
const bcrypt = require('bcryptjs/dist/bcrypt')
const myfunc = async () => {

const pass = "Baymax12345%"
const hashPassword = await bcrypt.hash(pass, 8)
console.log(hashPassword)

const isMatch = await bcrypt.compare('Baymax12345%', hashPassword)
console.log(isMatch)
}
myfunc() */

/* ----------------------------------- */



/* Jsonwebtoken example ------------------ */

/* const jwt  = require('jsonwebtoken');
const myfunc = async () => {
    const token = jwt.sign({_id:'1234567890'}, 'tokenScreat', {expiresIn:'1 day'})
    console.log(token)

    console.log(jwt.verify(token, 'tokenScreat'))
}
myfunc() */

/* ----------------------------------- */