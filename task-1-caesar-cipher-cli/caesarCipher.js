const alphabetUpper = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
const alphabetLower = alphabetUpper.toLowerCase();
const basis = alphabetUpper.length;

const checkLetter = char => {
    return alphabetUpper.indexOf(char) !== -1
        ? 'UPPERCASE'
        : alphabetLower.indexOf(char) !== -1
        ? 'LOWERCASE'
        : 'SPECIAL';
};

exports.makeCaesarCipher = ({ text, shift, action }) => {
    shift = shift % basis;
    let newStr = '';
    if (action === "encode") {
        text.split('').forEach(letter => {
            const typeOfChar = checkLetter(letter);
            if (typeOfChar !== 'SPECIAL') {
                const abcMatchIndex =
                    typeOfChar === 'UPPERCASE'
                        ? alphabetUpper.indexOf(letter)
                        : alphabetLower.indexOf(letter);
                const shiftedIndex =
                    abcMatchIndex + shift > basis - 1
                        ? abcMatchIndex + shift - basis
                        : abcMatchIndex + shift;

                return (newStr +=
                    typeOfChar === 'UPPERCASE'
                        ? alphabetUpper[shiftedIndex]
                        : alphabetLower[shiftedIndex]);
            }
            return (newStr += letter);
        });

    } else if (action === "decode") {
        text.split('').forEach(letter => {
            const typeOfChar = checkLetter(letter);
            if (typeOfChar !== 'SPECIAL') {
                const abcMatchIndex =
                    typeOfChar === 'UPPERCASE'
                        ? alphabetUpper.indexOf(letter)
                        : alphabetLower.indexOf(letter);
                const shiftedIndex =
                    abcMatchIndex - shift >= 0
                        ? abcMatchIndex - shift
                        : basis + (abcMatchIndex - shift);

                return (newStr +=
                    typeOfChar === 'UPPERCASE'
                        ? alphabetUpper[shiftedIndex]
                        : alphabetLower[shiftedIndex]);
            }
            return (newStr += letter);
        });
    }
    return newStr;
};
