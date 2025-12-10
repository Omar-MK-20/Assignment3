const path = require('node:path');
const fs = require('node:fs');

//#region Part1: Core Modules.

//#region 1. Use a readable stream to read a file in chunks and log each chunk.

function readFileStream(filePath)
{
    const fullFilePath = path.resolve(filePath);
    const readableFileStream = fs.createReadStream(fullFilePath,
        {
            encoding: "utf-8",
            highWaterMark: 150
        });

    readableFileStream.on("data", (chunk) =>
    {
        console.log(chunk);
        console.log("=============================================");
    });

    readableFileStream.on("end", () =>
    {
        console.log(`Streaming file: "${path.basename(fullFilePath)}" ended`);
    });

    readableFileStream.on("close", () =>
    {
        console.log(`Streaming file: "${path.basename(fullFilePath)}" closed`);
    });

    readableFileStream.on("error", (error) =>
    {
        console.log(error);
    });
    
}


// readFileStream("./big.txt")

//#endregion


//#region 2. Use readable and writable streams to copy content from one file to another.

function copyFileStream(sourcePath, destPath)
{
    const resolvedSourcePath = path.resolve(sourcePath);
    const resolvedDestPath = path.resolve(destPath);

    // console.log({resolvedSourcePath, resolvedDestPath});

    const readableSourceStream = fs.createReadStream(resolvedSourcePath,
        {
            encoding: "utf-8",
            highWaterMark: 150
        });

    const writableDestStream = fs.createWriteStream(resolvedDestPath);

    readableSourceStream.on("data", (chunk) =>
    {
        writableDestStream.write(chunk);
    });

    readableSourceStream.on("end", () =>
    {
        console.log(`Streaming file: "${path.basename(resolvedSourcePath)}" ended`);
        writableDestStream.end()
    });

    // writableDestStream.on("")

    readableSourceStream.on("error", (error) =>
    {
        console.log("readableSourceStream", error);
    });

    writableDestStream.on("error", (error) =>
    {
        console.log("writableDestStream", error);
    });
}


// copyFileStream("./source.txt", "./dest.txt")





