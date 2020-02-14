import * as mongoose from 'mongoose';


const patientSchema = new mongoose.Schema({
    person: {
        ref: 'Person',
        type: mongoose.Schema.Types.ObjectId,
    },
    email: String,
    password: String,

})

const patientModel = mongoose.model('Patient', patientSchema);

export default patientModel;