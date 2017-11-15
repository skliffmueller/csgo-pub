const restify = require('restify');
const redis = require('./lib/redis');

function redisSession(fields, accessTags) {
  if(!accessTags) {
    accessTags = []
  }
  return function(request, response, next) {
    redis.hget('session:'+request.headers['CPUB-Token'], 'user', (err, user) => {
      if(err) {
        // Send error response
        return;
      }

      try {
        user = JSON.parse(user);
      } catch(e) {

      }
      if(accessTags.length) {
        if(!user) {
          // Send Auth error session not found
          return;
        }
        let i = accessTags.filter((tag) => {
          return user.accessTags.includes(tag)
        }).length
        if(!i) {
          // Auth error not authorized
          return;
        }
      }

      request.session.user = user

      if(!fields.length) {
        next()
        return;
      }

      redis.hmget('session:'+request.headers['CPUB-Token'], fields, (err, f) => {
        if(err) {
          next()
          return;
        }
        fields.forEach((key, i) {
          request.session[key] = f[i]
        })
        next()
      })


    })
  }
}

module.exports = {
  redisSession: redisSession
};
