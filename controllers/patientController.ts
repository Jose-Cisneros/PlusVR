import express = require('express');
import { ApiConstants } from '../helpers/constants/api.constants';
import patientModel from '../model/domain/patient';
import personModel from '../model/domain/person';

class PatientController {
  private BASE_PATH = ApiConstants.API_BASE_PATH + 'patient/';

  public router = express.Router();

  constructor() {
    this.initializeRoutes();
  }

  private initializeRoutes() {
    this.router.get(this.BASE_PATH + 'hw', function(req, res) {
      res.send('Hello from the patient world!');
    });

    this.router.post(this.BASE_PATH + 'create', this.createPatient);
    this.router.get(this.BASE_PATH + 'all', this.getAllpatients);
    this.router.get(this.BASE_PATH + ':id', this.getpatientById);
  }

  // GET

  private getAllpatients = (request: express.Request, response: express.Response) => {
    patientModel.find().then(patients => {
      response.send(patients);
    });
  };

  // GET by ID

  private getpatientById = (request: express.Request, response: express.Response) => {
    const id = request.params.id;
    patientModel.findById(id).then(async patient => {
      await patient.populate('person').execPopulate();
      response.send(patient);
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
}



*/

  private createPatient = (request: express.Request, response: express.Response) => {
    const newPerson = request.body.person;
    const patientData = request.body.patient;
    const createdPerson = new personModel(newPerson);

    createdPerson.save().then(person => {
      patientData.person = person.id;
      const createdPatient = new patientModel(patientData);
      createdPatient.save().then(async savedPatient => {
        await savedPatient.populate('person').execPopulate();
        response.send(savedPatient);
      });
    });
  };
}
export default PatientController;
