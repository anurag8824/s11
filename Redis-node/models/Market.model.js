const mongoose = require('mongoose');

const MatchSchema = new mongoose.Schema({}, { strict: false, collection: 'markets' });

const Market = mongoose.model('market', MatchSchema);

module.exports = Market;


