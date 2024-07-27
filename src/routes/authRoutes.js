const express = require("express");
const authRoutes = express.Router();
const authController = require("../controllers/authController");
const authMiddleware = require("../middlewares/authMiddleware");


authRoutes.post("/auth/login", authController.login);

authRoutes.get("/auth/user", authMiddleware, authController.getUser);

authRoutes.post("/auth/createDummyAdmin", authController.addDummyAdmin);


module.exports = authRoutes;