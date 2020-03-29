const { Transform } = require("stream");
const { makeCaesarCipher } = require('./caesarCipher');

exports.transformStream = ({ shift, action }) => {
    return new Transform({
        readableObjectMode: true,
        writableObjectMode: true,
        transform(chunk, encoding, callback) {
            this.push(makeCaesarCipher({text: chunk, action, shift}));
            console.log(makeCaesarCipher({text: chunk, action, shift}));
            callback();
        }
    })
};
