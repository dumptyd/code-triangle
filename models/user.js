let mongoose = require('mongoose');
let findOrCreate = require('mongoose-findorcreate');
let userSchema = mongoose.Schema({
  github: {
    id: String,
    username: String,
    avatarUrl: String,
    accessToken: String
  },
  submitted: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Project'
  }]
},{timestamps:true});
userSchema.plugin(findOrCreate);
module.exports = mongoose.model('User', userSchema);