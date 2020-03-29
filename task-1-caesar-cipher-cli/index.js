const readline = require('readline');

const { action, shift, input, output } = require('./checkParams');
const { decode, encode } = require('./caesarCipher');

const nextLine = () => {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });

  rl.on('line', input => {
    let str = '';
    if (action === 'decode') {
      str = decode({ text: input, shift });
    } else if (action === 'encode') {
      str = encode({ text: input, shift });
    }
    console.log(str);
    rl.close();
    nextLine();
  });
};

if (input) {
} else {
  nextLine();
}
