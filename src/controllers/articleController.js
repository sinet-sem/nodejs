const Response = require("../responseBody/Response");
const { PrismaClient } = require('@prisma/client');
const dayjs = require('dayjs');
const prisma = new PrismaClient();

const getArticles = async (req, res) => {

   try{
        console.log("users : " +req.user);
        let page = parseInt(req.query.page) || 1;
        let limit = parseInt(req.query.pageSize) || parseInt(process.env.PAGESIZE);
        let result = [];
        let recordSkip = (page - 1) * limit;
       
        const totalRecord = await prisma.articles.findMany({
           where:{
            is_published:0
           }
          
        });

        const totalRecordPerPage = await prisma.articles.findMany({
            where:{is_published:0},
            include:{
                user:true
            },
            skip:recordSkip,
            take:limit,
            orderBy:{ID:'desc'}
        })

        totalRecordPerPage.forEach(art => {
            const createdAtFormat = dayjs(art.created_at);
            const updatedAtFormat = dayjs(art.updated_at);
            art.created_at = createdAtFormat.format("DD-MMM-YYYY h:mm A");
            art.updated_at = updatedAtFormat.format("DD-MMM-YYYY h:mm A");
            const { password: _, ...user } = art.user;
            art.user = user;
            result.push(art);
        });

        const total_page = Math.ceil(totalRecord.length/limit);
        const pagination ={
            total_record : totalRecord.length,
            limit : limit,
            current_page : page,
            total_page : total_page,
            has_next : page < total_page
        }
        return new Response(res).setResponse({articles:result, pagination:pagination}).setID(1).send();

    }catch(err){
        console.log("Error getArticle:" + err.message);
        return new Response(res).setID(0).setStatusCode(500).setMessage("Something went wrong.").send();
        
    }
};


const getArticleByID = async (req, res) => {

    try{
        let id = parseInt(req.params.id);
        const foundArticle = await prisma.articles.findFirst({
            where:{
                ID:id 
                
            },
            include: {
                user: true,
            },
        });
        if(!foundArticle){
            return new Response(res).setID(0).setStatusCode(404).setMessage("No data found.").send();
        } 
        const createdAtFormat = dayjs(foundArticle.created_at);
        const updatedAtFormat = dayjs(foundArticle.updated_at);
        foundArticle.created_at = createdAtFormat.format("DD-MMM-YYYY h:mm A");
        foundArticle.updated_at = updatedAtFormat.format("DD-MMM-YYYY h:mm A");
        const { password: _, ...user } = foundArticle.user;
        foundArticle.user = user;
        return new Response(res).setResponse(foundArticle).setID(1).send();

     }catch(err){
        console.log("Error getArticleByID:" + err.message);
        return new Response(res).setID(0).setStatusCode(500).setMessage("Something went wrong.").send();   
    }
};

const getArticleByFilter = async (req, res) =>{

    try{
        const result = [];
        const title  = req.query.title;
        const created_by = req.query.created_by;
        const contents  = req.query.contents;
        const is_published = req.query.is_published;
        // pagination       
        let page = parseInt(req.query.page) || 1;
        let limit = parseInt(req.query.pageSize) || parseInt(process.env.PAGESIZE);
        const startIndex = (page-1) * limit;
        const endIndex = page * limit;

        const articleList = await prisma.articles.findMany({
            where:{
                title:{contains : title}, 
                contents:{contains:contents},
                created_by: created_by,
                is_published:is_published,
               
            },
            include:{
                user:true,
            },
        })
        
        if(articleList.length == 0){
            return new Response(res).setID(0).setStatusCode(404).setMessage("No data found.").send();
        }
        const articles = articleList.slice(startIndex,endIndex);

        articles.forEach(art => {
            const createdAtFormat = dayjs(art.created_at);
            const updatedAtFormat = dayjs(art.updated_at);
            art.created_at = createdAtFormat.format("DD-MMM-YYYY h:mm A");
            art.updated_at = updatedAtFormat.format("DD-MMM-YYYY h:mm A");
            const { password: _, ...user } = art.user;
            art.user = user;
            result.push(art);
        });
        const total_page = Math.ceil(articleList.length/limit);
        const pagination ={
            total_record : articleList.length,
            limit : limit,
            current_page : page,
            total_page : total_page,
            has_next : page < total_page
        }
        return new Response(res).setResponse({articles:result, pagination:pagination}).setID(1).send();

    }catch(err){
        console.log("Error getArticlesByFilter:" + err.message);
        return new Response(res).setID(0).setStatusCode(500).setMessage("Something went wrong.").send();   
    }
}

const addArticle = async (req, res) => {
    try{ 
        const body = req.body;
        const { title, contents } = body;
       
        if(!title || !contents){
            return new Response(res).setID(0).setStatusCode(400).setMessage("Field is required.").send();
        }
        const foundArticle = await prisma.articles.findFirst({where:{title:title}});
        if(!foundArticle){

            await prisma.articles.create({ 
                data: {
                    title:title, 
                    contents:contents,
                    created_by: req.user.ID
                }, 
            });
            return new Response(res).setID(1).setStatusCode(201).setMessage("Article created successfully.").send();
        }
        return new Response(res).setID(0).setStatusCode(400).setMessage("Article already exist.").send();

    }catch(err){
        console.log("Error addArticle:" + err.message);
        return new Response(res).setID(0).setStatusCode(500).setMessage("Something went wrong.").send();
    }  
};

const updateArticle = async (req,res) =>{
    try{
        const body = req.body;
        const { title,contents,id, is_published } = body;
        if(!title || !contents){
            return new Response(res).setID(0).setStatusCode(400).setMessage("Field is required.").send();
        }

        const foundArticle = await prisma.articles.findFirst({where:{ID:id}});
        console.log("data: " + foundArticle);
        if(!foundArticle){
            return new Response(res).setID(0).setStatusCode(404).setMessage("No data found.").send();
        }

        const checkRecordExist = await prisma.articles.findFirst({where:{title:title}});

        if(checkRecordExist && checkRecordExist?.ID != id){
            return new Response(res).setID(0).setStatusCode(400).setMessage("Article already exist.").send();
        }else{
            await prisma.articles.update({
                where:{ID:id},
                data:{
                    title : title,
                    contents : contents,
                    is_published:is_published
                }
            });
            return new Response(res).setID(1).setMessage("Article updated successfully.").send();
        }
    }catch(err){
        console.log("Error updateArticle:" + err.message);
        return new Response(res).setID(0).setStatusCode(500).setMessage("Something went wrong.").send();
    } 
}

const deleteArticle = async (req,res) =>{
    try{
        const id = parseInt(req.params.id);
        if (isNaN(id)) {
            return new Response(res).setID(0).setStatusCode(400).setMessage("ID must be a number.").send;
        }
        const foundArticle = await prisma.articles.findFirst({where:{ID:id}});

        if(!foundArticle){
            return new Response(res).setID(0).setStatusCode(404).setMessage("No data found.").send();
        }
        await prisma.articles.delete({
            where: {ID:id},
        });
        return new Response(res).setID(1).setMessage("Article deleted successfully.").send();


    }catch(err){
        console.log("Error deleteArticle:" + err.message);
        return new Response(res).setID(0).setStatusCode(500).setMessage("Something went wrong.").send();
    } 
}


module.exports = {
    getArticles,
    getArticleByID,
    getArticleByFilter,
    addArticle,
    updateArticle,
    deleteArticle
};