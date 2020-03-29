const { Readable } = require("stream");

exports.readStream = (input) => {
    let readableText = new Readable({
        encoding: "utf8",
        objectMode: true,
    });

    readableText._read = () => {
        readableText.push(input);
        readableText.push(null);
    };

    return readableText;
};
