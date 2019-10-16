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
    this.router.get(this.BASE_PATH + 'speciality/:speciality', this.getDoctorsBySpecialty);
    this.router.get(this.BASE_PATH + ':id', this.getDoctorById);
    this.router.post(this.BASE_PATH + 'work/:id', this.addWorkableDay);
  }

  // GET
  // /vr/api/doctor/

  private getAllDoctors = async (request: express.Request, response: express.Response) => {
    const doctors = await doctorModel.find().populate('person');
    response.send(doctors);
  };

   // GET
  // /vr/api/doctor/speciality/:speciality

  private getDoctorsBySpecialty = async (request: express.Request, response: express.Response) => {
    const speciality = request.params.speciality;
    const doctors = await doctorModel.find({speciality: speciality}).populate('person');
    response.send(doctors);
  };


  // GET by ID
  // /vr/api/doctor/:id

  private getDoctorById = (request: express.Request, response: express.Response) => {
    const id = request.params.id;
    doctorModel.findById(id).then(async doctor => {
      await doctor.populate('person').execPopulate();
      response.send(doctor);
    });
  };

  /*
/vr/api/doctor/

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

  /*
POST 
/vr/api/doctor/work/:id
body:  
{
  WorkableDay:{
    name: String,
    startHour: Number,
    finishHour: Number,
    breakStart: Number,
    breakFinish: Number,
    maxAppointments: Number
  }
}
*/

  private addWorkableDay = (request: express.Request, response: express.Response) => {
    const id = request.params.id;
    doctorModel.findById(id).then(doctor => {
      const dayAlreadyExists = doctor.workableWeek.find(day => day.name === request.body.workableDay.name);
      if (dayAlreadyExists) {
        doctor.workableWeek = doctor.workableWeek.filter( element => !(element.name === dayAlreadyExists.name));
        doctor.workableWeek.push(request.body.workableDay);
        doctor.save();
        response.send(`Day ${request.body.workableDay.name} updated succesfully`);
      } else {
        doctor.workableWeek.push(request.body.workableDay);
        doctor.save();
        response.send(`Day ${request.body.workableDay.name} added succesfully`);
      }
    });
  };
}
export default MedicController;
