import * as mongoose from 'mongoose';

const prepaidSchema = new mongoose.Schema({
    id: String,
    name: String
})
const prepaidsModel = mongoose.model('prepaidsModel', prepaidSchema);

export default prepaidsModel;