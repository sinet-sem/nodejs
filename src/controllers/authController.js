const Response = require("../responseBody/Response");
const { PrismaClient } = require('@prisma/client');
const dayjs = require('dayjs');
const prisma = new PrismaClient();
const bcrypt = require('bcrypt');
const jwtLib = require("../libs/jwt");
const salt = 10;


const login = async (req, res) => {
    try {

        const { username, password } = req.body || {};
        console.log("username: " + username);
        console.log("password: " + password);
        console.log("🚀 ~ authRoutes.post ~ req.body:", req.body)

        if (!username || !password) {
            return res.status(400).send({ message: "Username and password required" });
        }

        const foundUser = await prisma.users.findFirst({ where: { username: username } });

        if (!foundUser || !bcrypt.compareSync(password, foundUser.password)) {
            return res.status(401).send({ statusCode: 401, message: "User or password incorrect" });
        }
        const user = {
            ID: foundUser.ID,
            username: foundUser.username,
        }
        const result = {
            token: jwtLib.generateToken(user),
            data: user
        }

        return new Response(res).setID(0).setStatusCode(200).setMessage("Login successful.").setResponse(result).send();
    } catch (err) {
        console.log("Error loginUser:" + err.message);
        return new Response(res).setID(0).setStatusCode(500).setMessage("Something went wrong.").send();
    }
};

const getUser = async (req, res) => {
    try {
        const loginId = req.user.ID;
        const foundUser = await prisma.users.findUnique({
            where: { ID: loginId }
        });
        const { password: _, ...user } = foundUser;

        return res.status(200).setID(1).send({ result: user, message: "found user" });

    } catch (err) {
        console.log("Error getUser:" + err.message);
        return new Response(res).setID(0).setStatusCode(500).setMessage("Something went wrong.").send();

    }
};

const addDummyAdmin = async (req, res) => {
    try {
        const password = "123"
        const adminPayload = {
            username: "admin",
            password: bcrypt.hashSync(password, salt),
        }

        await prisma.users.create({
            data: adminPayload
        });
        adminPayload.password = password;
        return new Response(res)
            .setResponse(adminPayload)
            .setID(1)
            .setStatusCode(201)
            .setMessage("User create successfully.")
            .send();

    } catch (err) {
        console.log("Error addUser:" + err.message);
        return new Response(res)
            .setID(0)
            .setStatusCode(500)
            .setMessage("Something went wrong.")
            .send();
    }
};

module.exports = {
    login,
    getUser,
    addDummyAdmin
};