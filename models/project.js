let mongoose = require('mongoose');

let projectSchema = mongoose.Schema({
  name: String,
  fullName: String,
  githubId: String,
  description: String,
  githubUrl: String,
  language: String,
  tags: [String]
});

module.exports = mongoose.model('Project', projectSchema);