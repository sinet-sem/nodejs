const express = require("express");
const articleRoutes = express.Router();
const articleController = require("../controllers/articleController");
const authMiddleware = require("../middlewares/authMiddleware");

articleRoutes.get("/articles",authMiddleware, articleController.getArticles);

articleRoutes.get("/article/:id",authMiddleware, articleController.getArticleByID);

articleRoutes.get("/articles/filter",authMiddleware, articleController.getArticleByFilter);

articleRoutes.post("/article", authMiddleware,articleController.addArticle);

articleRoutes.put("/article",authMiddleware, articleController.updateArticle);

articleRoutes.delete("/article/:id",authMiddleware, articleController.deleteArticle);

module.exports = articleRoutes;