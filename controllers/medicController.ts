import express = require('express');
import { ApiConstants } from '../helpers/constants/api.constants';
import doctorModel from '../model/domain/doctor';
import personModel from '../model/domain/person';

class MedicController {
  private BASE_PATH = ApiConstants.API_BASE_PATH + 'doctor/';

  public router = express.Router();

  constructor() {
    this.initializeRoutes();
  }

  private initializeRoutes() {
    this.router.get(this.BASE_PATH + 'hw', function(req, res) {
      res.send('Hello from the medic world!');
    });

    this.router.post(this.BASE_PATH + 'create', this.createDoctor);
    this.router.get(this.BASE_PATH + 'all', this.getAllDoctors);
    this.router.get(this.BASE_PATH + ':id', this.getDoctorById);
  }

  // GET

  private getAllDoctors = (request: express.Request, response: express.Response) => {
    doctorModel.find().then(doctors => {
      response.send(doctors);
    });
  };

  // GET by ID

  private getDoctorById = (request: express.Request, response: express.Response) => {
    const id = request.params.id;
    doctorModel.findById(id).then(async doctor => {
      await doctor.populate('person').execPopulate();
      response.send(doctor);
    });
  };

  /*

POST:{
  person: {
    firstName: String,
    lastName: String,
    birthDate: Date,
    dni: Number,
    phone: Number
  }
  doctor: {
    speciality: String
  }
}



*/

  private createDoctor = (request: express.Request, response: express.Response) => {
    const newPerson = request.body.person;
    const doctorData = request.body.doctor;
    const createdPerson = new personModel(newPerson);

    createdPerson.save().then(person => {
      doctorData.person = person.id;
      const createdDoctor = new doctorModel(doctorData);
      createdDoctor.save().then(async savedDoctor => {
        await savedDoctor.populate('person').execPopulate();
        response.send(savedDoctor);
      });
    });
  };
}
export default MedicController;
