import * as mongoose from 'mongoose';



const clinicSchema = new mongoose.Schema({
    name: String,
    adress: String
})


const clinicModel = mongoose.model('Clinic', clinicSchema);

export default clinicModel;