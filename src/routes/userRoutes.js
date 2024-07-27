const express = require("express");
const userRoutes = express.Router();
const userController = require("../controllers/userController");
const authMiddleware = require("../middlewares/authMiddleware");

userRoutes.get("/users",authMiddleware, userController.getUsers);

userRoutes.get("/user/:id",authMiddleware, userController.getUserByID);

userRoutes.post("/user",authMiddleware, userController.addUser);

userRoutes.put("/user",authMiddleware, userController.updateUser);

userRoutes.delete("/user/:id",authMiddleware, userController.deleteUser);

module.exports = userRoutes;