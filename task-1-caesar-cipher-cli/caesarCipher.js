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

exports.encode = ({ text, shift }) => {
  shift = shift % basis;
  let encodeStr = '';

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

      return (encodeStr +=
        typeOfChar === 'UPPERCASE'
          ? alphabetUpper[shiftedIndex]
          : alphabetLower[shiftedIndex]);
    }
    return (encodeStr += letter);
  });
  return encodeStr;
};

exports.decode = ({ text, shift }) => {
  shift = shift % basis;
  let decodeStr = '';

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

      return (decodeStr +=
        typeOfChar === 'UPPERCASE'
          ? alphabetUpper[shiftedIndex]
          : alphabetLower[shiftedIndex]);
    }
    return (decodeStr += letter);
  });
  return decodeStr;
};
