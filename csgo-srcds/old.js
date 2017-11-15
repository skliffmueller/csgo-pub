'use strict'

const http = require('http')

const redis = require('redis')

const spawn = require("child_process").spawn;

const imgfs = require("./lib/imgfs")

function createRedisClient(options, cb) {
	const redisClient = redis.createClient(options.port || 6379, options.host)
	if (options.auth) {
	  redisClient.auth(options.auth)
	}  

	redisClient.on('ready', () => {
	  console.log('Redis Cache Client connected and ready.')
	  if(cb)
	  	cb(null, redisClient)
	})

	redisClient.on("error", err => {
	  console.log(`Redis Cache Client Error: ${err}`)
	  if(cb)
	  	cb(err)
	})

	return redisClient
}






let app = null;
let serverRecord = null;

let server = http.createServer((req, res) => {

	var method = req.method;
	var url = req.url;
	var headers = req.headers;

	res.setHeader('Content-Type', 'application/json');
	res.setHeader('X-Powered-By', 'mudkipz');

	if(!headers['csgo-token'] || headers['csgo-token']!=='password') {
		res.statusCode = 403
    res.write(JSON.stringify({error:true, message:"token required"}))
		res.end()
		return;
	}


	if(method=='OPTIONS') {
		res.statusCode = 200
		res.end()
		return;
	}
	if(method=='GET') {
		getStatus(req, res)
		return;
	}
	if(method=='DELETE') {
		killProcess(req, res)
		return;
	}
	if(method=='POST') {
		var body = [];
		req.on('data', function(chunk) {
		  body.push(chunk);
		}).on('end', function() {
		  body = Buffer.concat(body).toString();
		  try {
		  	req.body = JSON.parse(body);
			} catch(e) {
				req.body = body
			}
			spawnServer(req, res)
		  // at this point, `body` has the entire request body stored in it as a string
		});
		return;
	}
	res.statusCode = 401;
  res.write(JSON.stringify({error:true, message:"method not found"}))
	res.end()

});

server.listen(process.env.PORT || 8080);

function killProcess(req, res) {
	if(serverRecord) {
		res.statusCode = 200
		res.write(JSON.stringify(serverRecord))
		app.kill()
		res.end()
	} else {
		res.statusCode = 400
    res.write(JSON.stringify({error:true, message:"server instance not found"}))
		res.end()
	}
}

function getStatus(req, res) {
	if(serverRecord) {
		res.statusCode = 200
		res.write(JSON.stringify(serverRecord))
		res.end()
	} else {
		res.statusCode = 400
    res.write(JSON.stringify({error:true, message:"server instance not found"}))
		res.end()
	}
}

function spawnServer(req, res) {
	if(serverRecord) {
		res.statusCode = 400
    res.write(JSON.stringify({error:true, message:"server instance currently running"}))
		res.end()
		return;
	}
	serverRecord = req.body

	/*req.body
	{
		_id:"",
		startArgv:[ '-game',
		  'csgo',
		  '-console',
		  '-usercon',
		  '+game_type',
		  '0',
		  '+game_mode',
		  '1',
		  '+map',
		  'de_dust2',
		  '+sv_setsteamaccount',
		  'A902BE6675F829F3899798DBE0DCC808',
		  '+ip',
		  '174.138.62.128' ]
		  // rcon password 5omethingaboutMudkipz?
	}
	*/

	let r = createRedisClient(serverRecord.redis)

	r.on('ready', () => {
	  r.hset('shell:servers', serverRecord._id, "1", (err, res) => {
	    if(err) {
				res.statusCode = 500
    		res.write(JSON.stringify({error:true, message:"redis error", stack:err}))
				res.end()
	      return;
	    }

	    go()
	  })
	})

	r.on("error", err => {
		res.statusCode = 500
    res.write(JSON.stringify({error:true, message:"redis error", stack:err}))
		res.end()
	})

	function go() {

		app = spawn(
			'/var/app/csgo/srcds_run',
			serverRecord.srcds.startArgv
		)

		app.on('error', (error) => {
			console.log('child process error', error)
		})

		app.stdout.setEncoding('utf8')


		app.stdout.on('data', data => sendLog(data))

		//app.stderr.on('data', data => sendLog(data));

		app.on('close', (code) => {
			r.hdel('shell:servers', serverRecord._id)
			serverRecord = null
		  console.log(`child process exited with code ${code}`);
		});



		res.statusCode = 201
		res.write(JSON.stringify(serverRecord))
		res.end()
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
      serverId:serverRecord._id,
      source:"scds",
      line:"",
      createdAt:new Date().toISOString()
    }
    lines.forEach((line) => {
      log.line = line;

	    let jsonString = JSON.stringify(log)

	    r.rpush('rcon:log:'+serverRecord._id, jsonString)
	    r.publish('rcon:channel', jsonString)
    })

	  console.log(`stdout: ${data}`);
	}
}