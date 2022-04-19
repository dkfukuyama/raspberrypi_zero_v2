const slk = require('./slacksend');
const ut = require('./utils');
const exec = require('child_process').exec;
require('date-utils');



sch_array = [
    {
        name : 'CLEAN WAV FILES',
        time : {
            hour : 5,
            min : 12,
            sec : 18,
        },
        command : 'curl -d \'mode=clean_wav\' http://localhost/command'
    },

]


function isBetween(target, dateStart, dateEnd){
    const de = dateEnd.getHours() * 3600 + dateEnd.getMinutes() * 60 + dateEnd.getSeconds();
    const ds = dateStart.getHours() * 3600 + dateStart.getMinutes() * 60 + dateStart.getSeconds();
    const dt = target.hour * 3600 + target.min * 60 + target.sec;
    return (ds <= dt && dt < de);
}

async function start(){

    let currentTime = new Date();
    let prevTime = new Date();
    let currentTime_f;
    let prevTime_f;

    for(;;await ut.delay_ms(10000)){
        prevTime = currentTime;
        currentTime = new Date();
        prevTime_f = currentTime_f;
        currentTime_f = currentTime.toFormat('YYYY-MM-DD HH24:MI:SS');
        
        // テスト時のみ
        if(!process.env.COMPUTERNAME.startsWith('PI'))
        {
            for(let i=0; i<sch_array.length; i++){
                let res = isBetween(sch_array[i].time, prevTime, currentTime);
                if(res){
                    exec(sch_array[i].command, (err, stdout, stderr) => {
                        slk.slacksend(sch_array[i].command);
                        if (err) {
                            slk.slacksend(err);
                        }else{
                            console.log(`stdout: ${stdout}`)
                            slk.slacksend(stdout);
                        }
                    });
                } 
            } 
        }
    }
}


exports.start = start;