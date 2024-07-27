const express = require("express");
const dotenv = require("dotenv");
const userRoute = require("./routes/userRoutes");
const articleRoute = require("./routes/articleRoutes");
const authRoute = require("./routes/authRoutes");

const router = express();
router.use(express.json());

dotenv.config({path: __dirname + "/../.env"});


router.use("/api",userRoute);
router.use("/api",articleRoute);
router.use("/api",authRoute);

router.listen(process.env.PORT, ()=>{
    console.log(`Server running at http://localhost:${process.env.PORT}`)
})