import * as express from 'express';
import { ApiConstants } from '../helpers/constants/api.constants';
import clinicModel from '../model/domain/clinic';
import clinicDoctorModel from '../model/domain/clinic-doctor';

class ClinicController {
  public router = express.Router();

  private BASE_PATH = ApiConstants.API_BASE_PATH + 'clinic/';

  constructor() {
    this.initializeRoutes();
  }

  public initializeRoutes() {
    this.router.post(this.BASE_PATH + 'new', this.newClinic);
    this.router.post(this.BASE_PATH + 'add', this.addDoctorToClinic);
    this.router.delete(this.BASE_PATH + 'remove', this.removeDoctorFromClinic);
    this.router.get(this.BASE_PATH + 'doctors/:id', this.getDoctorsByClinic);
    this.router.get(this.BASE_PATH + 'myclinics/:id', this.getClinicsByDoctor);
    this.router.get(this.BASE_PATH + 'all', this.getAllClinics);
    this.router.get(this.BASE_PATH + ':id', this.getClinicById);
    this.router.get(this.BASE_PATH + 'doctors/:id/:speciality', this.getDoctorsBySpeciality);


  }

    /*
  /vr/api/clinic/new
  
  POST:{
    clinic: {
      name: String,
      adress: String,
    }
  }
  
  */
 
  private newClinic = (request: express.Request, response: express.Response) => {
    const newClinic = request.body.clinic;
    const createdClinic = new clinicModel(newClinic);
    
    createdClinic.save().then(response.send(createdClinic));
  };

  // /vr/api/clinic/add

  /*
  POST:{
    clinic: id,
    doctor: id
    }
  }
  
  */
 
  private addDoctorToClinic = (request: express.Request, response: express.Response) => {
    const newRelation = request.body;
    const createdRelation = new clinicDoctorModel(newRelation);
    createdRelation.save().then(response.send(createdRelation));
  };

  // /vr/api/clinic/remove
  /*
  DELETE:{
    clinic: id,
    doctor: id
    }
  }
  
  */

  private removeDoctorFromClinic = async (request: express.Request, response: express.Response) => {
    const toRemove = await clinicDoctorModel.deleteOne({clinic: request.body.clinic, doctor: request.body.doctor});
    if( toRemove.n >= 1) {
      response.send('doctor was removed from clinic');
    } else {
      response.send('doctor is not associated with the clinic');
    }
  };

  
  // GET  /vr/api/clinic/doctors/:id

  private getDoctorsByClinic = async (request: express.Request, response: express.Response) => {
    const id = request.params.id;
    const populated = await clinicDoctorModel.find({clinic: id}).populate({
      path: 'doctor',
      populate: {
        path:'person'
      }
    });
    
    response.send(populated);    
  };

    // GET  /vr/api/clinic/myclinics/:id

    private getClinicsByDoctor = async (request: express.Request, response: express.Response) => {
      const id = request.params.id;
      const populated = await clinicDoctorModel.find({doctor: id}).populate('clinic');
      
      response.send(populated);    
    };

  // GET  /vr/api/clinic/all

  private getAllClinics = async (request: express.Request, response: express.Response) => {
    const clinics = await clinicModel.find();
    
    response.send(clinics);    
  };


  // GET  /vr/api/clinic/:id

  private getClinicById = async (request: express.Request, response: express.Response) => {
    const clinic = await clinicModel.findById(request.params.id);
    
    response.send(clinic);    
  };

  // GET  /vr/api/clinic/:id/:speciality

  private getDoctorsBySpeciality = async (request: express.Request, response: express.Response) => {
    const id = request.params.id;
    const speciality = request.params.speciality;
    const populated = await clinicDoctorModel.find({clinic: id}).populate({
      path: 'doctor',
      populate: {
        path:'person'
      }
    });
    const filtered = populated.filter(populated => populated.doctor.speciality === speciality);
    response.send(filtered);      
  };


}

export default ClinicController;
