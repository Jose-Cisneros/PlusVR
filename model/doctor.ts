import * as mongoose from 'mongoose';


const doctorSchema = new mongoose.Schema({
    person: {
        ref: 'Person',
        type: mongoose.Schema.Types.ObjectId,
    },
    speciality: String,

})

const doctorModel = mongoose.model('Doctor', doctorSchema);

export default doctorModel;