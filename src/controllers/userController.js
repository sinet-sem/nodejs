const Response = require("../responseBody/Response");
const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');
const prisma = new PrismaClient();
const salt = 10;

const getUsers = async (req, res) => {

   try{
        let page = parseInt(req.query.page) || 1;
        let limit = parseInt(process.env.PAGESIZE);
        let result = [];
        let recordSkip = (page - 1) * limit;
       
        const totalRecord = await prisma.users.findMany();

        const totalRecordPerPage = await prisma.users.findMany({
            skip:recordSkip,
            take:limit,
            orderBy:{ID:'desc'}
        })

        totalRecordPerPage.forEach(us => {
            const { password: _, ...user } = us;
            result.push(user);
        });

        const total_page = Math.ceil(totalRecord.length/limit);
        const pagination ={
            total_record : totalRecord.length,
            limit : limit,
            current_page : page,
            total_page : total_page,
            has_next : page < total_page
        }
        return new Response(res).setResponse({users:result, pagination:pagination}).setID(1).send();

    }catch(err){
        console.log("Error getUser:" + err.message);
        return new Response(res).setID(0).setStatusCode(500).setMessage("Something went wrong.").send();
        
    }
};


const getUserByID = async (req, res) => {

    try{
        let id = parseInt(req.params.id);
        const foundUser = await prisma.users.findFirst({
            where:{
                ID:id, 
            }
        });
        if(!foundUser){
            return new Response(res).setID(0).setStatusCode(404).setMessage("No data found.").send();
        } 
        const { password: _, ...user } = foundUser;
        return new Response(res).setResponse(user).setID(1).send();

     }catch(err){
        console.log("Error getUserByID:" + err.message);
        return new Response(res).setID(0).setStatusCode(500).setMessage("Something went wrong.").send();   
    }
};

const addUser = async (req, res) => {
    try {
        const body = req.body;

        const { username, password } = body;

        if (!username) {
            return new Response(res)
                .setID(0)
                .setStatusCode(400)
                .setMessage("Username is required.")
                .send();
        }

        if (!password) {
            return new Response(res)
                .setID(0)
                .setStatusCode(400)
                .setMessage("Password is required.")
                .send();
        }

        const foundUser = await prisma.users.findFirst({
            where: { username: username },
        });
        if (!foundUser) {
            await prisma.users.create({
                data: {
                    username: username,
                    password: bcrypt.hashSync(password, salt),
                },
            });
            return new Response(res)
                .setID(1)
                .setStatusCode(201)
                .setMessage("User created successfully.")
                .send();
        }
        return new Response(res)
            .setID(0)
            .setStatusCode(400)
            .setMessage("User already exist.")
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

const updateUser = async (req,res) =>{
    try{
        const body = req.body;
        const { username, password,id } = body;
        if(!username || !password){
            return new Response(res).setID(0).setStatusCode(400).setMessage("Field is required.").send();
        }

        const foundUser = await prisma.users.findFirst({where:{ID:id}});

        if(!foundUser){
            return new Response(res).setID(0).setStatusCode(404).setMessage("No data found.").send();
        }

        const checkRecordExist = await prisma.users.findFirst({where:{username:username}});

        if(checkRecordExist && checkRecordExist?.ID != id && bcrypt.compareSync(password, foundUser.password)) {
           return new Response(res).setID(0).setStatusCode(400).setMessage("User already exist.").send();
        }else{
            await prisma.users.update({
                where:{ID:id},
                data:{
                    username : username,
                    password : bcrypt.hashSync(password, salt),
                }
            });
            return new Response(res).setID(1).setMessage("User updated successfully.").send();
        }
    }catch(err){
        console.log("Error updateUser:" + err.message);
        return new Response(res).setID(0).setStatusCode(500).setMessage("Something went wrong.").send();
    } 
}

const deleteUser = async (req,res) =>{
    try{
        const id = parseInt(req.params.id);
        if (isNaN(id)) {
            return new Response(res).setID(0).setStatusCode(400).setMessage("ID must be a number.").send;
        }
        const foundUser = await prisma.users.findFirst({where:{ID:id}});

        if(!foundUser){
            return new Response(res).setID(0).setStatusCode(404).setMessage("No data found.").send();
        }
        await prisma.users.delete({
            where: {ID:id},
        });
        return new Response(res).setID(1).setMessage("User deleted successfully.").send();


    }catch(err){
        console.log("Error deleteUser:" + err.message);
        return new Response(res).setID(0).setStatusCode(500).setMessage("Something went wrong.").send();
    } 
}


module.exports = {
    getUsers,
    addUser,
    updateUser,
    getUserByID,
    deleteUser
   // getCategoryByFilter
};