const mongoose = require('mongoose');



// const validator = require("validator");
const bottleSchema = new mongoose.Schema({
    type: {
    type: String, 
    required: true, 
    enum: ['plastique', 'verre'] 
},

  quantity: { 
    type: Number,
    required: true,
     default: 1
     },

  binId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Poubelles', 
    required: true 
    },

  userId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: true 
      },

  createdAt: { 
    type: Date,
    default: Date.now 
}
});

const Bottle = mongoose.model('Bottle', bottleSchema);
module.exports=Bottle;