const fs = require('fs');
const xml2js = require('xml2js');
const util = require('util');
const parser = new xml2js.Parser({ mergeAttrs: true, explicitArray: false, preserveChildrenOrder: true });
const filePath = process.argv[2]; // Set path to xml file;
const outName = process.argv[3]; // Set path to out txt file

let fileObject = {};

const file = fs.readFileSync(filePath, 'utf8');
parser.parseString(file, (err, result) => { // parse xml file
    if (err) throw err;
    fileObject = result; // convert whole xml file to JavaScript object
});
if (fileObject['tt']) {
    fileObject = fileObject['tt']; // remove <tt> tag
}
const writer = fs.createWriteStream(outName, {}); // function writes to txt file
const convertToString = obj => { // convert JavaScript Object to String
    let str = '';
    for (const key in obj) {
        const tagValue = `${obj[key]}`;
        let attributeString = `${key}: ${tagValue}`;
        const formattedLength = 32 - attributeString.length;
        attributeString = attributeString.concat(' '.repeat(formattedLength));
        str = `${str}${attributeString}` // concat attribute string to return value
    }
    return str;
}
for (const key in fileObject) {
    if (Array.isArray(fileObject[key])) { // if we have same tags in xml; example: <uz> </uz>, <uz> </uz> --> parser converts such case to one array of tags
        for (const dataItem of fileObject[key]) {
            writer.write(`${key}`);
            const keys = Object.keys(dataItem);
            let i = 0;
            let writableObject = {};
            while (i < keys.length) {
                if (i % 4 === 0) { // if we have 4 tags to write to file
                    const string = convertToString(writableObject);
                    writer.write(`${string}\n`); // write to string line
                    writableObject = {};
                }
                const tag = keys[i];
                writableObject = { ...writableObject, [tag]: dataItem[tag] } // append attribute to object
                i++;
            }
            const string = convertToString(writableObject);
            writer.write(`${string}\n\n`);
        }
    } else {
        writer.write(`${key}`);
        const dataItem = fileObject[key];
        const keys = Object.keys(dataItem);
        let i = 0;
        let writableObject = {};
        while (i < keys.length) {
            if (i % 4 === 0) {
                const string = convertToString(writableObject);
                writer.write(`${string}\n`);
                writableObject = {};
            }
            const tag = keys[i];
            writableObject = { ...writableObject, [tag]: dataItem[tag] }
            i++;
        }
        const string = convertToString(writableObject);
        writer.write(`${string}\n\n`);
    }
}

