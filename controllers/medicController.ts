import express = require('express');
import { ApiConstants } from '../helpers/constants/api.constants';
import doctorModel from '../model/doctor';


class MedicController {

private BASE_PATH = ApiConstants.API_BASE_PATH + 'doctor/';

public router = express.Router();
private doctor = doctorModel;

constructor() {
   this. initializeRoutes();
}

private initializeRoutes(){
    this.router.get(this.BASE_PATH + 'hw', function(req, res) {
        res.send('Hello from the medic world!');
      });

      this.router.post(this.BASE_PATH + 'create', this.createDoctor);
}

private createDoctor = (request: express.Request, response: express.Response) => {
  const doctorData = request.body;
  const createdDoctor = new doctorModel(doctorData);
  createdDoctor.save()
  .then( savedDoctor => {
    response.send(savedDoctor);
  })
}
 
}
export default MedicController;
