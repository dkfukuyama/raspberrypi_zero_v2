const ut = require('./utils');
const vars = require('./variables');
const path = require('path')
const fs = require('fs');

async function getAsync(baseDir) {
    let dir = vars.globalVars().saveDir0;

    if (baseDir) dir = path.join(dir, baseDir);

    return new Promise((resolve, reject) => {
        fs.readdir(dir, function (err, files) {
            if (err) reject(err);
            var fileList = [];
            var dirList = [];
            files.filter(
                (file) => path.join(dir, file).isDirectory || /.*\.mp3$/.test(file) //çiÇËçûÇ›
            ).forEach(function (file) {
                if (path.join(dir, file).isDirectory) dirList.push(file);
                else fileList.push(file);
            });

            resolve({ directories: dirList, files: fileList });
        });
    });
}

async function get(baseDir) {
    await getAsync(baseDir);
}

exports.getAsync = getAsync;
exports.get = get;

console.log(get());
