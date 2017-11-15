'use strict'

const spawn = require("child_process").spawn;

const redis = require("./lib/redis")
const imgfs = require("./lib/imgfs")

/*
    Expected ENV
    CSGO_SERVER_ID:"1234567"
    CSGO_IMAGE_PATH:"/var/image/asdasdsa.qcow2",
    CSGO_START_EXEC:"/var/app/csgo/srcds_run",
    CSGO_START_ARGV:"-game csgo -console -usercon +game_type 0 +game_mode 1 +map de_dust2 +sv_setsteamaccount A902BE6675F829F3899798DBE0DCC808 +ip 174.138.62.128"
    REDIS_HOST:"localhost",
    REDIS_PORT:6379
    REDIS_PASSWORD:""
*/

let app;

redis.on('ready', () => {
    redis.hset('shell:servers', process.env.CSGO_SERVER_ID, "1", (err, res) => {
	    if(err) {
            process.exit()
            // Process exit
	        return;
	    }
	    go()
	})
})

function go() {
    imgfs.mountImage("/dev/nbd0", process.env.CSGO_IMAGE_PATH, "/var/app/csgo")
        .then((stdout, stderr) => {
            startServer(process.env.CSGO_START_EXEC, process.env.CSGO_START_ARGV)
        })
        .catch((err) => {
            imgfs.unmountImage("/dev/nbd0")
                .then((stdout, stderr) => {
                    process.exit()
                    // process exit kill
                })
                .catch((err) => {
                    process.exit()
                })
        })
}

function startServer(exec, args) {
    console.log('start', exec, args)
    app = spawn(
        exec,
        args.split(" ")
    )
    app.on('error', (error) => {
        console.log('child process error', error)
    })
    app.stdout.setEncoding('utf8')
    app.stdout.on('data', data => sendLog(data))
    //app.stderr.on('data', data => sendLog(data));
    app.on('close', (code) => {
        redis.hdel('shell:servers', process.env.CSGO_SERVER_ID)
        console.log(`child process exited with code ${code}`);
        imgfs.unmountImage("/dev/nbd0")
            .then((stdout, stderr) => {
                process.exit()
                // process exit kill
            })
            .catch((err) => {
                process.exit()
            })

    });
}

let lineBuffer = "";

function sendLog(data) {
    let lines = (lineBuffer + data).split("\n");
    if(data[data.length-1] != '\n') {
        lineBuffer = lines.pop();
    } else {
        lineBuffer = '';
    }
    let log = {
        serverId:process.env.CSGO_SERVER_ID,
        source:"scds",
        line:"",
        createdAt:new Date().toISOString()
    }
    lines.forEach((line) => {
        log.line = line;

        let jsonString = JSON.stringify(log)

        redis.rpush('rcon:log:'+process.env.CSGO_SERVER_ID, jsonString)
        redis.publish('rcon:channel', jsonString)
    })

    console.log(`stdout: ${data}`);
}
