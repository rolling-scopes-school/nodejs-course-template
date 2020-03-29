const { program } = require('commander');

const actionList = ['decode', 'encode'];

program
    .option('-s, --shift <num>', 'shift is required param')
    .option('-i, --input <filename>', 'input file path')
    .option('-o, --output <filename>', 'output file path')
    .option('-a, --action <action>', 'action encode/decode is required param')
    .parse(process.argv);

if(program.input && program.output && program.input === program.output) {
    process.stderr("input/output files must be different");
    process.exit(11);
}

if (!program.action) {
    process.stderr("variable 'action' is required");
    process.exit(11);
} else if (actionList.indexOf(program.action) === -1) {
    process.stderr("variable 'action' only must be decode/encode");
    process.exit(11);
}

if (program.shift === undefined || program.shift < 1) {
    process.stderr("variable 'shift' is required");
    process.exit(11);
}

exports.action = program.action;
exports.input = program.input;
exports.output = program.output;
exports.shift = +program.shift;
