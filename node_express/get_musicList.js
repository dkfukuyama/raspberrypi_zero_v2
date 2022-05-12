const ut = require('./utils');
const vars = require('./variables');
const path = require('path')
const fs = require('fs');

function get(baseDir) {
    let dir = vars.globalVars().saveDir0;

    if (baseDir) dir = path.join(dir, baseDir);

    let files = fs.readdirSync(dir);

    let fileList = [];
    let dirList = [];
    files.forEach(function (file) {
        let temp_file = path.join(dir, file);
        let stat = fs.statSync(temp_file);

        if (stat.isDirectory() && ! new RegExp(vars.globalVars().voiceSubDir).test(file)) dirList.push(file);
        else if(/.*\.(mp3|wav)$/.test(temp_file)) fileList.push(file);
    });
    return {
        fileList:fileList,
        dirList:dirList
    };
}

exports.get = get;

//console.log(get());
