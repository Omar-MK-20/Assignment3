const path = require('node:path');
const fs = require('node:fs');
const zlib = require('node:zlib');

//#region Part1: Core Modules.

//#region 1. Use a readable stream to read a file in chunks and log each chunk.


/**
 * logging the data of the `filePath` as chunks using stream.
 * the chunks size could be specified using `chunkSize`, the default value is `150`.
 * @param {string} filePath - Path of the file that will be logged
 * @param {number} [chunkSize=150] The size of the logged chunk, 1 equals one character, `default = 150`.
 */

function readFileStream(filePath, chunkSize = 150)
{
    const fullFilePath = path.resolve(filePath);
    const readableFileStream = fs.createReadStream(fullFilePath,
        {
            encoding: "utf-8",
            highWaterMark: chunkSize
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


/**
 * A function that copies the data from the `sourcePath` file to the `destPath` file using streams 
 * @param {string} sourcePath - Path of the source file that will be copied.
 * @param {string} destPath - Path of the destination file that will receive the copied data.
 * @returns {void}
 */

function copyFileStream(sourcePath, destPath)
{
    const resolvedSourcePath = path.resolve(sourcePath);
    const resolvedDestPath = path.resolve(destPath);

    // create reading stream for source file
    const readableSourceStream = fs.createReadStream(resolvedSourcePath,
        {
            encoding: "utf-8",
            highWaterMark: 150
        });

    // create writing stream for destination file
    const writableDestStream = fs.createWriteStream(resolvedDestPath);

    // reading the data chunks from the source file
    readableSourceStream.on("data", (chunk) =>
    {
        // writing the data chunks to the dest file
        writableDestStream.write(chunk);
    });

    // when reading data ends
    readableSourceStream.on("end", () =>
    {
        console.log(`file "${path.basename(resolvedSourcePath)}" copied using streams`);
        console.log(`Streaming file: "${path.basename(resolvedSourcePath)}" ended`);
        // ending wring data on dest file
        writableDestStream.end();
    });

    // when reading data closes
    readableSourceStream.on("close", () =>
    {
        console.log(`Streaming file: "${path.basename(resolvedSourcePath)}" closed`);
    });

    // when writing data closes
    writableDestStream.on("close", () =>
    {
        console.log(`Streaming file: "${path.basename(resolvedDestPath)}" closed`);

    });



    readableSourceStream.on("error", (error) =>
    {
        console.log("readableSourceStream", error);
    });

    writableDestStream.on("error", (error) =>
    {
        console.log("writableDestStream", error);
    });
}


// copyFileStream("./source.txt", "./dest.txt");


//#endregion


//#region 3. Create a pipeline that reads a file, compresses it, and writes it to another file.


/**
 * A function that pipes the data to a new `.gz` compressed file 
 * in the same directory, without modifying the original file.
 * using streams.
 * @param {string} filePath - Path of the file you want to compress
 */

function compressFile(filePath)
{
    const resolvedFilePath = path.resolve(filePath);
    const resolvedCompressedPath = path.resolve(`${filePath}.gz`);

    // console.log(resolvedFilePath);
    // console.log(resolvedCompressedPath);

    const readableFileStream = fs.createReadStream(resolvedFilePath, { encoding: "utf-8" });
    const gzipFileStream = zlib.createGzip();
    const writableCompressedStream = fs.createWriteStream(resolvedCompressedPath, { encoding: "utf-8" });


    readableFileStream.pipe(gzipFileStream).pipe(writableCompressedStream);


    //#region readableFile stream events (open, end, close, error)
    readableFileStream.on("open", () =>
    {
        console.log(`Stream reading data from "${path.basename(resolvedFilePath)}" Opened`);
    });

    readableFileStream.on("end", () =>
    {
        console.log(`Stream reading data from "${path.basename(resolvedFilePath)}" Ended`);
    });

    readableFileStream.on("close", () =>
    {
        console.log(`Stream reading data "${path.basename(resolvedFilePath)}" Closed`);
    });

    readableFileStream.on("error", (error) =>
    {
        console.log(`Error on file "${path.basename(resolvedFilePath)}": `, error);
    });
    //#endregion


    //#region writableCompressed stream events (open, finish, close, error)
    writableCompressedStream.on("open", () =>
    {
        console.log(`Stream writing data to "${path.basename(resolvedCompressedPath)}" Opened`);
    });

    writableCompressedStream.on("finish", () =>
    {
        console.log(`Stream writing data to "${path.basename(resolvedCompressedPath)}" Finished`);
    });

    writableCompressedStream.on("close", () =>
    {
        console.log(`Stream writing data "${path.basename(resolvedCompressedPath)}" Closed`);
    });

    writableCompressedStream.on("error", (error) =>
    {
        console.log(`Error on file "${path.basename(resolvedCompressedPath)}": `, error);
    });
    //#endregion


    //#region gzip stream events (finish, end, close, error)
    gzipFileStream.on("finish", () =>
    {
        console.log(`gzip finished writing data from the readableStream "${path.basename(resolvedFilePath)}"`);
    });

    gzipFileStream.on("end", () =>
    {
        console.log(`gzip ended reading data to the writableStream "${path.basename(resolvedCompressedPath)}"`);
    });

    gzipFileStream.on("close", () =>
    {
        console.log(`Streaming gzip Closed`);
    });

    gzipFileStream.on("error", (error) =>
    {
        console.log(`Error on "gzipFileStream": `, error);
    });
    //#endregion


}

// compressFile("data.txt");

//#endregion 


//#endregion




