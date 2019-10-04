import express = require('express');
import { ApiConstants } from '../helpers/constants/api.constants';


class MedicController {

private BASE_PATH = ApiConstants.API_BASE_PATH + 'medic/';

public router = express.Router();

constructor() {
   this. initializeRoutes();
}

private initializeRoutes(){
    this.router.get(this.BASE_PATH + 'hw', function(req, res) {
        res.send('Hello from the medic world!');
      });
}

}
export default MedicController;
