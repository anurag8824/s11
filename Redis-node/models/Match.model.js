const mongoose = require('mongoose');

const MatchSchema = new mongoose.Schema({}, { strict: false, collection: 'matches' });

const Match = mongoose.model('Match', MatchSchema);

module.exports = Match;


