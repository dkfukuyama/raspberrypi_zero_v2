const gh = require('./google_home');

require('date-utils');

async function test_main() {
    let dts = new Date().add({ "minutes": 30 });
    let dte = new Date().add({ "minutes": 60 });
    console.log(dts);
    console.log(dte);

    let g = await gh.getCalJson(dts, dte);
    console.log(g);
}


test_main();
