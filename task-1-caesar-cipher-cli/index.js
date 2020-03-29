const readline = require("readline");
const path = require("path");
const fs = require("fs");

const { action, shift, input, output } = require("./checkParams");
const { transformStream } = require("./createTransformStream");
const { readStream } = require("./readStream");

const transformText = (stream) => {
    let transformChunk = transformStream({ shift, action });
    stream.pipe(transformChunk);

};

const nextLine = () => {
    const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout
    });

        rl.on('line', input => {
        transformText(readStream(input));
        rl.close();
        nextLine();
    });
};

if (input) {
    const inputPath = path.join(__dirname, input);
    fs.stat(inputPath, (error, stats) => {
        if(error) {
            process.stderr("File not found");
            process.exit(11)
        } else {
            const readingStream = fs.createReadStream( inputPath, {
                encoding: "utf8",
                objectMode: true,
            });
            transformText(readingStream);
        }
    })

    } else {
        nextLine();
}
