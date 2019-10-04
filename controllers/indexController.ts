import * as express from 'express';
import medicController from '../controllers/medicController';

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
