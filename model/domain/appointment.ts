
import * as mongoose from 'mongoose';

const appointmentSchema = new mongoose.Schema({
  approved: Boolean,
  date: String,
  hour: String,
  info: String,
  doctor: {
    ref: 'Doctor',
    type: mongoose.Schema.Types.ObjectId,
  },
  patient: {
    ref: 'Patient',
    type: mongoose.Schema.Types.ObjectId,
  },
});

const appointmentModel = mongoose.model('Appointment', appointmentSchema);

export default appointmentModel;