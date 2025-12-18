const path = require('node:path');
const fs = require('node:fs');
const http = require('node:http');

//#region Part2: Simple CRUD Operations Using HTTP

const usersFilePath = path.resolve('users.json');

const users = JSON.parse(fs.readFileSync(usersFilePath));

let port = 3000;
const server = http.createServer((req, res) =>
{
    //#region events
    res.on("finish", () =>
    {
        console.log(`Response has been finished writing upon`);
    });

    res.on("close", () =>
    {
        console.log(`Response closed`);
    });

    res.on("error", (error) =>
    {
        console.log(`Response Error: `, error);
    });

    req.on("end", () =>
    {
        console.log(`Request has been ended reading upon`);
    });

    req.on("close", () =>
    {
        console.log(`Request closed`);
    });

    req.on("error", (error) =>
    {
        console.log(`Request error: `, error);
    });
    //#endregion

    console.log("======================");
    console.log(`New request received`);

    const jsonContentType = "application/json";

    const addUserIsExecuted = addUser(req, res, jsonContentType);
    console.log("🚀 ~ addUserIsExecuted:", addUserIsExecuted);
    if (addUserIsExecuted)
    { return; }

    const updateUserIsExecuted = updateUser(req, res, jsonContentType);
    console.log("🚀 ~ updateUserIsExecuted:", updateUserIsExecuted);
    if (updateUserIsExecuted)
    { return; }

    const deleteUserIsExecuted = deleteUser(req, res, jsonContentType);
    console.log("🚀 ~ deleteUserIsExecuted:", deleteUserIsExecuted);
    if (deleteUserIsExecuted)
    { return; }

    const getAllUsersIsExecuted = getAllUsers(req, res, jsonContentType);
    console.log("🚀 ~ getAllUsersIsExecuted:", getAllUsersIsExecuted);
    if (getAllUsersIsExecuted)
    { return; }

    const getSingleUserIsExecuted = getSingleUser(res, req, jsonContentType);
    console.log("🚀 ~ getSingleUserIsExecuted:", getSingleUserIsExecuted);
    if (getSingleUserIsExecuted)
    { return; }

    res.writeHead(404, { "content-type": jsonContentType });
    res.write(errorReturn("Invalid Method or URL"));
    return res.end();

});


server.listen(port, () =>
{
    console.log(`Server is running on port :: ${port}`);
});

server.on('error', (error) =>
{
    if (error.code == "EADDRINUSE")
    {
        ++port;
        server.listen(port);
    }
});




//#region 1. Create an API that adds a new user to your users stored in a JSON file.


function addUser(req, res, contentType)
{


    const { url, method } = req;

    if (url == "/user" && method == "POST")
    {
        let body = "";
        req.on("data", (chunk) =>
        {
            body += chunk;
        });

        req.on("end", () =>
        {
            body = JSON.parse(body);

            if (!body.name || !body.age || !body.email)
            {
                res.writeHead(400, { "content-type": contentType });
                res.write(errorReturn("Data missing in request body"));
                return res.end();
            }

            const existUser = users.find(user => user.email == body.email);

            if (existUser)
            {
                res.writeHead(409, { "content-type": contentType });
                res.write(errorReturn("Email already exists."));
                return res.end();
            }

            users.push({ id: users[users.length - 1].id + 1, ...body });
            fs.writeFileSync(usersFilePath, JSON.stringify(users));

            res.writeHead(201, { "content-type": contentType });
            res.write(successReturn("User added successfully."));
            return res.end();
        });
        return true;
    }
}

//#endregion

//#region 2. Create an API that updates an existing user's name, age, or email by their ID.

function updateUser(req, res, contentType)
{
    const { url, method } = req;

    if (url.includes("/user") && method == "PATCH")
    {

        const id = url.split('/')[2];

        const user = users.find(user => user.id == id);

        if (!user)
        {
            res.writeHead(404, { "content-type": contentType });
            res.write(errorReturn("User ID not found"));
            res.end();
            return true;
        }


        let body = "";
        req.on("data", (chunk) =>
        {
            body += chunk;
        });


        req.on("end", () =>
        {
            body = JSON.parse(body);

            if (!body.age)
            {
                res.writeHead(400, { "content-type": contentType });
                res.write(errorReturnReturn("Missing age property"));
                return res.end();
            }

            user.age = body.age;

            fs.writeFileSync(usersFilePath, JSON.stringify(users));

            res.writeHead(200, { "content-type": contentType });
            res.write(successReturn("User age updated successfully."));
            return res.end();
        });
        return true;
    }
}

//#endregion

//#region 3. Create an API that deletes a User by ID.

function deleteUser(req, res, contentType)
{
    const { url, method } = req;

    if (url.includes("/user") && method == "DELETE")
    {

        const id = url.split('/')[2];

        const index = users.findIndex(user => user.id == id);

        if (index == -1)
        {
            res.writeHead(404, { "content-type": contentType });
            res.write(errorReturn("User ID not found."));
            res.end();
            return true;
        }

        users.splice(index, 1);

        fs.writeFileSync(usersFilePath, JSON.stringify(users));

        res.writeHead(200, { "content-type": contentType });
        res.write(successReturn("User deleted successfully."));
        res.end();
        return true;
    }
}




//#endregion

//#region 4. Create an API that gets all users from the JSON file.

function getAllUsers(req, res, contentType)
{

    const { url, method } = req;

    if (url == "/user" && method == "GET")
    {

        res.writeHead(200, { "content-type": contentType });
        res.write(JSON.stringify(users));
        res.end();
        return true;
    }
}

//#endregion

//#region 5. Create an API that gets User by ID.

function getSingleUser(res, req, contentType)
{
    const { url, method } = req;

    if (url.includes("/user") && method == "GET")
    {
        const id = url.split("/")[2];

        const user = users.find(user => user.id == id);

        if (!user)
        {
            res.writeHead(404, { "content-type": contentType });
            res.write(errorReturn("User not found."));
            res.end();
            return true;
        }

        res.writeHead(200, { "content-type": contentType });
        res.write(JSON.stringify(user));
        res.end();
        return true;
    }
}





//#endregion






// ============================================================================
//#region helper functions

/**
 * A function that gets the message and put in an object, then stringify the error response object
 * @param {string} message - The message that will be sent in the response
 * @returns {string} A stringified `JSON`
 * 
 * @example - errorReturn("Email already exists.")
 * // returns: '{"message":"Email already exists."}'
 */

function errorReturn(message)
{
    // i'd prefer the object to be { error: message }, but i complied with the requirements.
    return JSON.stringify({ message: message });
}



/**
 * A function that gets the message and put in an object, then stringify the success response object
 * @param {string} message - The message that will be sent in the response
 * @returns {string} A stringified `JSON`
 * 
 * @example - successReturn("User added successfully.")
 * // returns: '{"message":"User added successfully"}'
 */

function successReturn(message)
{
    return JSON.stringify({ message: message });
}


//#endregion
