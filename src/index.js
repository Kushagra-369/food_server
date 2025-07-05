const express = require("express")  // framework 
const mongoose = require("mongoose") // database 
const dotenv = require("dotenv")
const router = require("./Routes/Routes.js")  // path 
const cors = require('cors')
const URLnotfound = require("./middleware/URLnotfound.js")

dotenv.config() 
const app = express()
app.use(cors())

app.use(express.json()) 
const port = 8080 

mongoose.connect(process.env.mongoosedburl)
.then(()=>console.log('mongodb connected successfully'))
.catch((e)=>console.log(e))

app.use('/', router)

app.use(URLnotfound)

app.listen(port,()=>console.log('server is running ', port))


