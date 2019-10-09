import * as express from 'express';

class IndexController {
  public router = express.Router()
  constructor() {
    this.initializeRoutes();
  }

  public initializeRoutes() {
    this.router.get('/hc', function(req, res) {
      res.send('App is alive!');
    });
  }

}

export default IndexController;
