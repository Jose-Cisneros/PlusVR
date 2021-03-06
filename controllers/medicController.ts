
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
    this.router.post(this.BASE_PATH + 'update/:id', this.updateDoctor);
    this.router.get(this.BASE_PATH + 'all', this.getAllDoctors);
    this.router.get(this.BASE_PATH + 'speciality/:speciality', this.getDoctorsBySpecialty);
    this.router.get(this.BASE_PATH + ':id', this.getDoctorById);
    this.router.post(this.BASE_PATH + 'work/:id', this.addWorkableDay);
    this.router.get(this.BASE_PATH + 'week/:id', this.getWorkableWeekById);    
    this.router.post(this.BASE_PATH + 'prepaid/:id', this.addPrepaid);
    this.router.post(this.BASE_PATH + 'rating/:id/:rating', this.rateDoctor);
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
  
  // GET by ID
  // /vr/api/doctor/week/:id
  
  private getWorkableWeekById = (request: express.Request, response: express.Response) => {
    const id = request.params.id;
    doctorModel.findById(id).then(doctor => {
      response.send(doctor.workableWeek);
    });
  };
  
  /*
  /vr/api/doctor/new
  
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
  /vr/api/doctor/update/:id
  
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
      adress: String
    }
  }
  
  
  
  */
 
 private updateDoctor = async (request: express.Request, response: express.Response) => {
  const id = request.params.id;
  const updated = request.body;

  let doctor = await doctorModel.findById(id);

  let res1 = await personModel.update({_id: doctor.person}, updated.person);
  let res2 = await doctorModel.update({_id: doctor.id}, {speciality: updated.doctor.speciality});

  response.send('Doctor updated');
 };
  
  /*
  POST 
  /vr/api/doctor/work/:id
  body:  
  {
    WorkableDay:{
      name: String,
      number: Number,
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
   if (request.body.workableDay.finishHour > 24 
      || request.body.workableDay.startHour > 24 
      || request.body.workableDay.breakStart > 24 
      || request.body.workableDay.breakFinish > 24) {
    response.status(400).send('Day can not have more than 24 hours, tonto');
    return;
   }
   doctorModel.findById(id).then(doctor => {
     if (doctor.workableWeek.length > 0) {
       const dayAlreadyExists = doctor.workableWeek.find(day => day.number === request.body.workableDay.number);
       if (dayAlreadyExists) {
         doctor.workableWeek = doctor.workableWeek.filter( element => !(element.number === dayAlreadyExists.number));
         doctor.workableWeek.push(request.body.workableDay);
         doctor.save();
         response.send(`Day ${request.body.workableDay.number} updated succesfully`);
         return;
        } else {
          doctor.workableWeek.push(request.body.workableDay);
          doctor.save();
          response.send(`Day ${request.body.workableDay.number} added succesfully`);
        }
      } else {
        doctor.workableWeek.push(request.body.workableDay);
        doctor.save();
        response.send(`Day ${request.body.workableDay.number} added succesfully`);
      }
    });
  };
  
  // POST
  // /vr/api/doctor/rating/:id/:rating
  /*
  body:  
  {
    comment:String
  }
  */
 
  private rateDoctor = async (request: express.Request, response: express.Response) => {
    const id = request.params.id;
    const rating  = Number(request.params.rating);
    const doctor = await doctorModel.findById(id);
    const currentRating = doctor.rating? doctor.rating * doctor.ratingCount : 0;
    doctor.ratingCount? doctor.ratingCount++ : doctor.ratingCount = 1;
    const newRating = ((currentRating + rating) / doctor.ratingCount);
    if(request.body.review) doctor.review.push(request.body.review);
    doctor.rating = newRating;
    doctor.save();
    response.send("Rating updated successfully");
        
 
  };
  
  /*
POST 
/vr/api/doctor/prepaid/:id
body:  
{
  prepaid:{
    name: String,
  }
}
*/

  private addPrepaid = (request: express.Request, response: express.Response) => {
    const id = request.params.id;
    doctorModel.findById(id).then(doctor => {
      const prepaidAlreadyExists = doctor.prepaid.find(org => org.name === request.body.prepaid.name);
      if (prepaidAlreadyExists) {
        response.send(`Prepaid ${request.body.prepaid.name} already exists`);
      } else {
        doctor.prepaid.push(request.body.prepaid);
        doctor.save();
        response.status(400).send(`Prepaid ${request.body.prepaid.name} added succesfully`);
      }
    });
  };
}
export default MedicController;
