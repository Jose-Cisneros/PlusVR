import express = require('express');
import { ApiConstants } from '../helpers/constants/api.constants';
import doctorModel from '../model/domain/doctor';
import personModel from '../model/domain/person';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs'
import { Request, Response } from 'express'
import patientModel from '../model/domain/patient';
import prepaidModel from '../model/domain/prepaid'


const SECRET_KEY = 'secretkey12345'

class AuthController {
  private BASE_PATH = ApiConstants.API_BASE_PATH + 'auth/';

  public router = express.Router();

  constructor() {
    this.initializeRoutes();
  }

  private initializeRoutes() {
    this.router.get(this.BASE_PATH + 'hw', function(req, res) {
      res.send('Hello from the patient world!');
    });

    this.router.post(this.BASE_PATH + 'register', this.createDoctor);
    this.router.post(this.BASE_PATH + 'login', this.login);
    this.router.post(this.BASE_PATH+ 'registerPatient', this.createPatient);
    this.router.post(this.BASE_PATH+ 'loginPatient', this.loginPatient);
    this.router.post(this.BASE_PATH + 'newPrepaid', this.newPrepaid);
    this.router.get(this.BASE_PATH+ 'allPrepaids', this.allPrepaids);
    
  
  
  }
  
  private createDoctor = (request: Request, response: Response) => {
    const newPerson = request.body.person;
    const doctorData = request.body.doctor;
    doctorData.password = bcrypt.hashSync(doctorData.password);
    const createdPerson = new personModel(newPerson);
    

    createdPerson.save().then(person => {
      doctorData.person = person.id;
      const createdDoctor = new doctorModel(doctorData);
      createdDoctor.save().then(async savedDoctor => {
        const accessToken: string = jwt.sign({ _id: savedDoctor._id}, SECRET_KEY, {expiresIn : 60 * 60 } )
        await savedDoctor.populate('person').execPopulate();
        
        
        response.header('token', accessToken).send( savedDoctor) ;
      });
    });
  };
  private createPatient = (request: express.Request, response: express.Response) => {
    const newPerson = request.body.person;
    const patientData = request.body.patient;
    patientData.password = bcrypt.hashSync(patientData.password);
    const createdPerson = new personModel(newPerson);

    createdPerson.save().then(person => {
      patientData.person = person.id;
      const createdPatient = new patientModel(patientData);
      createdPatient.save().then(async savedPatient => {
        const accessToken: string = jwt.sign({ _id: savedPatient._id}, SECRET_KEY, {expiresIn : 60 * 60 } )
        await savedPatient.populate('person').execPopulate();
        response.status(200).send({
          user: savedPatient,
          token: accessToken
        });
      });
    });
  };




  private login = async (req: Request, res: Response) => {
    console.log(req.body);
    const email = req.body.email;
    const doctor = await doctorModel.findOne({email: email}).populate('person');
    if (!doctor) return res.status(400).json('email or password is wrong');
    const validate : boolean =  await bcrypt.compare(req.body.password, doctor.password);
    if (!validate) return res.status(400).json('Email or Password is wrong');
    const accessToken: string = jwt.sign({ _id: doctor._id}, SECRET_KEY, {expiresIn : 60 * 60 * 24 });
    res.status(200).send({
      user: doctor,
      token: accessToken
    });
     
  };

  private loginPatient = async (req: Request, res: Response) => {
    console.log(req.body);
    const email = req.body.email;
    const patient = await patientModel.findOne({email: email}).populate('person');
    if (!patient) return res.status(400).json('email or password is wrong');
    const validate : boolean =  await bcrypt.compare(req.body.password, patient.password);
    if (!validate) return res.status(400).json('Email or Password is wrong');
    const accessToken: string = jwt.sign({ _id: patient._id}, SECRET_KEY, {expiresIn : 60 * 60 * 24 });
    res.status(200).send({
      user: patient,
      token: accessToken
    });
     
  };

  private all  = async (request: express.Request, response: express.Response) => {
    prepaidModel.find().then(res =>   response.send(res) );
  
 
 }

 private allPrepaids  = async (request: express.Request, response: express.Response) => {
  const prepaid = await prepaidModel.find()
      response.send(prepaid) 
 

}

private newPrepaid =  (request: express.Request, response: express.Response) => {
 const prepaid = new prepaidModel();
 prepaid.name = request.body.name
 prepaid.save().then( res =>
  response.status(400).send(prepaid))

}
 
}




export default AuthController;