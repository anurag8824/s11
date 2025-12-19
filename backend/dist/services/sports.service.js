"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const api_1 = require("../util/api");
class SportsService {
    getSports() {
        return api_1.sportsApi.get('/get-sports');
    }
    getSeries(sportId) {
        return api_1.sportsApi.get(`/get-series?EventTypeID=${sportId}`);
    }
    getMatches(sportId, competitionId) {
        return api_1.sportsApi.get(`/get-matches?EventTypeID=${sportId}&CompetitionID=${competitionId}`);
    }
    getMarkets(match) {
        return api_1.sportsApi.get(`/get-marketes?sportId=${match.sportId}&EventID=${match.matchId}`);
    }
    getBookmakerMarkets(match) {
        return api_1.sportsApi.get(`/get-bookmaker-marketes?sportId=${match.sportId}&EventID=${match.matchId}`);
    }
    getT10Markets(matchId) {
        return api_1.sportsApi.get(`/get-marketes-t10?EventID=${matchId}`);
    }
    getSession(matchId, sportId) {
        return api_1.sportsApi.get(`/get-sessions?MatchID=${matchId}&sportId=${sportId}`);
    }
    getSessionT10(matchId) {
        return api_1.sportsApi.get(`/get-sessions-t10?MatchID=${matchId}`);
    }
}
exports.default = new SportsService();
//# sourceMappingURL=sports.service.js.map