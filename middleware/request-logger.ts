import * as express from 'express';

var requestLogger = function requestLogger(request: express.Request, response: express.Response, next: any) {
  console.log(`${request.method} ${request.path}`);
  next();
}


export default requestLogger;