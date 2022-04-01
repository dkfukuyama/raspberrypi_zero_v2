const httpServer = require("http").createServer();
const io = require("socket.io")(httpServer, {
  // ...
});

io.on("connection", (socket) => {
  console.log("connection");
  socket.emit("message", "SEND MESSAGE CONTENT From RaspberryPi");
});

const { exec } = require('child_process').execSync;
async function calc_test(str){

    const str_calc = `node -e console.log("${str}")`;
    console.log(str_calc);
    let ret = null;
    exec(str_calc, (err, stdout, stderr) => {
        if (err) {
            console.log(`stderr: ${stderr}`)
            return;
        }
        ret = parseFloat(stdout);
    })
    console.log(ret);
}

calc_test('3+4');

//httpServer.listen(8092);




