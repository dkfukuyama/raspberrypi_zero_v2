let GL_VARS = {};
let firstTry = true;

const path = require('path');

function globalVars(){

    try{
        if(firstTry || GL_VARS.errorFlag){
            console.log("LOAD VAL");
            GL_VARS.errorFlag = true;
            GL_VARS.serverPort = (process.env.SERVER_PORT ?? 8091);
            GL_VARS.voiceSubDir = (process.env.VOICE_SUBDIR ?? '/g_dlfile');

            GL_VARS.httpDir0 = `http://${getLocalAddress().ipv4[0].address}:${GL_VARS.serverPort}`;
            GL_VARS.httpDir = path.join(GL_VARS.httpDir0, GL_VARS.voiceSubDir);

            GL_VARS.g_calenderSummaryUrl = process.env.G_CAL_SUM;

            switch(process.env.COMPUTERNAME){
                case 'FUKU333_DESKTOP':
                    GL_VARS.saveDir0 = "\\\\LANDISK-201129\\disk1\\music";
                    break;
                case 'PI_ZERO_01':
                    GL_VARS.saveDir0 = "/mnt/nas_music";
                    break;
                case 'KAIHATU-Z440A':
                    GL_VARS.saveDir0 = __dirname;
            }
            GL_VARS.saveDir = path.join(GL_VARS.saveDir0, GL_VARS.voiceSubDir);
            firstTry = false;
        }
    }catch(err){
        GL_VARS.errorFlag = true;
        console.log(err);
    }
    GL_VARS.errorFlag = false;
    return GL_VARS;
}


function getLocalAddress() {
    const os = require('os');
    let ifacesObj = {}
    ifacesObj.ipv4 = [];
    ifacesObj.ipv6 = [];
    let interfaces = os.networkInterfaces();

    for (let dev in interfaces) {
        interfaces[dev].forEach(function(details){
            if (!details.internal){
                switch(details.family){
                    case "IPv4":
                        ifacesObj.ipv4.push({name:dev, address:details.address});
                    break;
                    case "IPv6":
                        ifacesObj.ipv6.push({name:dev, address:details.address})
                    break;
                }
            }
        });
    }
    return ifacesObj;
};

globalVars();

exports.globalVars = globalVars;