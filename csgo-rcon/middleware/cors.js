const restify = require('restify');

function unknownMethodHandler(request, response) {
  if (request.method.toLowerCase() !== 'options') {

    return response.send(new restify.MethodNotAllowedError());

  } else {

    var allowHeaders = ['Accept', 'Accept-Version', 'Content-Type', 'Api-Version', 'Origin', 'X-Requested-With', 'Authorization', 'CPUB-Date', 'CPUB-Token']

    if (response.methods.indexOf('OPTIONS') === -1) {
      response.methods.push('OPTIONS');
    }

    response.header('Access-Control-Allow-Credentials', true)
    response.header('Access-Control-Allow-Headers', allowHeaders.join(', '))
    response.header('Access-Control-Allow-Methods', response.methods.join(', '))
    response.header('Access-Control-Allow-Origin', request.headers.origin)

    return response.send(200)
  }
}

module.exports = {
  unknownMethodHandler: unknownMethodHandler
};
