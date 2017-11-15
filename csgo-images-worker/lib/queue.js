const async = require('async')

let config = {
  concurrency: 1 // This should be an env or something
}


let routes = {}

let q = async.queue((obj, callback) => {
    if(!routes[obj.controller]) {
      return callback("Controller does not exist")
    }
    if(!routes[obj.controller][obj.action]) {
      return callback("Action does not exist")
    }

    routes[obj.controller][obj.action](obj.data, q, callback)

}, config.concurrency);


q.drain = function() {
  console.log('All processes complete, Idling')
};

q.error = function(error, task) {
  console.log('Error occured on task')
}

function mount(controller, action, fn){
  if(!routes[controller]) {
    routes[controller] = {}
  }
  if(!routes[controller][action]) {
    routes[controller][action] = fn
  } else {
    throw "action exists"
  }
  return routes
}

// Debug stuff only
let lastIdle = new Date();
let lastQueLengths = [];
/*setInterval(() => {
  // This is just for debugging purposes
  // This will announce if our task que is overflowing
  // If this happen we might want to:
  // up the concurrency, deploy more nodes, or improve our db queries

  if(q.idle()) {
    lastIdle = new Date()
  }

  if(lastQueLengths.length>5) {
    lastQueLengths.splice(0,1)
  }
  lastQueLengths.push(q.length())

  var msTime = (new Date() - lastIdle)
  var maxTime = 5*60*60*1000 // 5 minutes
  var list = lastQueLengths.join(',')

  if(msTime > maxTime) {
    var minutes = msTime/(60*60*1000);
    console.log(`WARNING: Que has been full for ${minutes} minutes`)
    console.log(`Last 5 minutes of que lengths: ${list}`)
  }
}, 5000)*/

module.exports = {
  push: q.push,
  mount: mount
}