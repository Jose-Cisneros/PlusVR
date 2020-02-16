
import * as mongoose from 'mongoose';

const clinicDoctorSchema = new mongoose.Schema({
  doctor: {
    ref: 'Doctor',
    type: mongoose.Schema.Types.ObjectId,
  },
  clinic: {
    ref: 'Clinic',
    type: mongoose.Schema.Types.ObjectId,
  },
});

const clinicDoctorModel = mongoose.model('ClinicDoctor', clinicDoctorSchema);

export default clinicDoctorModel;