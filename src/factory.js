const aws = require('aws-sdk');
const Handler = require('./handler');

const rekoSvc = new aws.Rekognition();
const translateSvc = new aws.Translate();
const handler = new Handler({ rekoSvc, translateSvc });

// O bind serve para assegurar que o contexto this é a instancia de handler
module.exports = handler.main.bind(handler)