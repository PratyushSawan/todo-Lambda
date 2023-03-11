const db = require ("./db");
const {
    GetItemCommand,
    PutItemCommand,
    DeleteItemCommand,
    ScanCommand,
    UpdateItemCommand
} = require("@aws-sdk/client-dynamodb");
const {marshall,unmarshall} = require("@aws-sdk/util-dynamodb")

const createPost = async (event) =>{
    const response = {statusCode:200};

    try{
        const body = JSON.parse(event.body);
        const params = {
            TableName: process.env.DYNAMODB_TABLE_NAME,
            Item: marshall(body || {}),
        };
        const createResult = await db.send(new PutItemCommand(params));

        response.body = JSON.stringify({
            message: "Successfully created post.",
            createResult,
        })
    }catch(err){
        console.error(err);
        response.statusCode = 500
        response.body = JSON.stringify({
            message: "Failed to create post.",
            errorMsg: err.message,
            errorStack: err.stack
        })
    }

    return response;
}

const getPost = async (event) =>{
    const response = {statusCode:200};

    try{
        const params = {
            TableName: process.env.DYNAMODB_TABLE_NAME,
            Key: marshall({postId: event.pathParameteres.postId}),
        };
        const {Item} = await db.send(new GetItemCommand(params));

        console.log({Item});
        response.body = JSON.stringify({
            message: "Successfully retrived post.",
            data: (Item) ? unmarshall(Item): {},
            rawData: Item,
        })
    }catch(err){
        console.error(err);
        response.statusCode = 500
        response.body = JSON.stringify({
            message: "Failed to get post.",
            errorMsg: err.message,
            errorStack: err.stack
        })
    }

    return response;
}

const updatePost = async (event) =>{
    const response = {statusCode:200};

    try{
        const body = JSON.parse(event.body);
        const objKeys = Object.keys(body);
        const params = {
            TableName: process.env.DYNAMODB_TABLE_NAME,
            Key: marshall({postId: event.pathParameteres.postId}),
            UpdateExpression: `SET ${objKeys.map((_, index) => `#key${index} = :value${index}`).join(", ")}`,
            ExpressionAttributeNames: objKeys.reduce((acc, key, index) => ({
                ...acc,
                [`#key${index}`]: key,
            }), {}),
            ExpressionAttributeValues: marshall(objKeys.reduce((acc, key, index) => ({
                ...acc,
                [`:value${index}`]: body[key],
            }), {})),
        };
        const updateResult = await db.send(new UpdateItemCommand(params));
s
        response.body = JSON.stringify({
            message: "Successfully updated post.",
            updateResult
        })
    }catch(err){
        console.error(err);
        response.statusCode = 500
        response.body = JSON.stringify({
            message: "Failed to update post.",
            errorMsg: err.message,
            errorStack: err.stack
        })
    }

    return response;
}

const deletePost = async (event) =>{
    const response = {statusCode:200};

    try{
        const params = {
            TableName: process.env.DYNAMODB_TABLE_NAME,
            Key: marshall({postId: event.pathParameteres.postId}),
        };
        const delteResult = await db.send(new DeleteItemCommand(params));

        response.body = JSON.stringify({
            message: "Successfully deleted post.",
            delteResult
        })
    }catch(err){
        console.error(err);
        response.statusCode = 500
        response.body = JSON.stringify({
            message: "Failed to delete post.",
            errorMsg: err.message,
            errorStack: err.stack
        })
    }

    return response;
}



const getAllPosts = async (event) =>{
    const response = {statusCode:200};

    try{
        const {Items} = await db.send(new ScanCommand({TableName: process.env.DYNAMODB_TABLE_NAME}));

        response.body = JSON.stringify({
            message: "Successfully retrived post.",
            data: Items.map((item)=> unmarshall(item)),
            Items
        })
    }catch(err){
        console.error(err);
        response.statusCode = 500
        response.body = JSON.stringify({
            message: "Failed to retrive post.",
            errorMsg: err.message,
            errorStack: err.stack
        })
    }

    return response;
}


module.exports = {
    getPost,
    createPost,
    updatePost,
    deletePost,
    getAllPosts
}