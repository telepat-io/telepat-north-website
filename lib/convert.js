const { convertTelepatCode } = require('./code.js');
const { convertHandbook } = require('./handbook.js');

console.log("Building Telepat North deployment...");
console.log("Transpiling Markdown...");

convertTelepatCode();
console.log("Code section DONE");
convertHandbook();
console.log("Handbook section DONE");