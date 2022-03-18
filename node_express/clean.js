const fs = require('fs');
const path = require('path');
const vars = require('./variables');
function clean_wav(leftnum) {

    let dir = vars.globalVars().saveDir;
    console.log(dir);
    fs.readdir(dir, function (err, files) {
        if (err) throw err;
        var fileList = [];
        files.filter(function (file) {
            let f = path.join(dir, file);
            return fs.statSync(f).isFile() && /.*\.wav$/.test(file); //çiÇËçûÇ›
        }).forEach(function (file) {
            fileList.push(file);
        });
        fileList.sort();
        let n = fileList.length - leftnum;
        n = (n < 0 ? 0 : n);
        console.log(n);
        fileList.slice(0, n).forEach(f => {
            const f0 = path.join(dir, f);
            console.log(f0);
            try {
                fs.unlinkSync(f0);
                console.log('DELETED');
            } catch (error) {
                console.log("ERROR : " + JSON.stringify(error));
            }
        });
    });
    return "";
}

exports.clean_wav = clean_wav;