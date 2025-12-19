const mongoose = require('mongoose');
const axios = require('axios');
const { Bet, Match, Market, Balances, User, BetLock, CasinoMatch, Lenah, Denah } = require('./models'); // Adjust the path to your models

// Constants
const superNodeUrl = "http://localhost:3025/api/";
const casinoNodeUrl = "http://localhost:3025/api/";
const defaultRatio = {
    ownRatio: 100,
    allRatio: [
        {
            parent: mongoose.Types.ObjectId('63382d9bfbb3a573110c1ba5'),
            ratio: 100,
        },
    ],
};
const defaultSettings = { minBet: 100, maxBet: 100, delay: 0 };

const BetOn = {
    FANCY: 'FANCY',
    MATCH_ODDS: 'MATCH_ODDS',
    CASINO: 'CASINO',
    CASINOFANCY: 'CASINOFANCY',
};

// Utility Functions
function error(obj, message = '') {
    return {
        message: message,
        code: 401,
        error: true,
        data: {},
    };
}

function delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

// Database Functions
async function get_user_info(user_id) {
    return await User.findOne({ _id: mongoose.Types.ObjectId(user_id) });
}

async function get_user_balance(user_id) {
    return await Balances.findOne({ userId: user_id });
}

async function GetMatchInfo(payload) {
    return payload.betOn === "CASINO"
        ? await CasinoMatch.findOne({ match_id: parseInt(payload.matchId) })
        : await Match.findOne({ matchId: parseInt(payload.matchId) });
}

async function getMarketRunner(payload, matchInfo) {
    if (payload.betOn === "CASINO") {
        const marketRunnerFinder = matchInfo.event_data.market.find(market => market.MarketName === payload.marketName);
        return marketRunnerFinder ? marketRunnerFinder.Runners : [];
    } else {
        const market_current_bet = await Market.findOne({ marketId: payload.marketId, matchId: parseInt(payload.matchId) });
        return market_current_bet ? market_current_bet.runners : [];
    }
}

// Validation Functions
async function validate_bet(payload, userInfo, balance, settings, matchInfo) {
    if (payload.betOn === "CASINO" && matchInfo.status === 0) {
        return { message: 'failed', notification: "Match Not In Play" };
    }
    // Add the rest of the validation logic here...
}

async function checkAllOddsCondition(payload) {
    if (payload.marketName !== 'Fancy' && payload.betOn !== BetOn.CASINO) {
        const errors = await checkMarketOddsConditions(payload.marketId, payload.marketName, payload.selectionId, payload.isBack, payload.odds, payload.selectionName);
        if (errors) return { message: "failed", notification: errors };
    } else if (payload.betOn === BetOn.CASINO) {
        const errors = await checkCasinoOddsConditions(payload.gtype, payload.selectionId, payload.isBack, payload.odds, payload.stack);
        if (errors) return { message: "failed", notification: errors };
    } else {
        const errors = await checkFancyOddsConditions(payload.matchId, payload.selectionId, payload.isBack, payload.odds, payload.selectionName);
        if (errors) return { message: "failed", notification: errors };
    }
    return null;
}

// Odds Checking Functions
async function checkMarketOddsConditions(market_id, market_name, selection_id, is_back, odds, selection_name) {
    const current_odds = await getcurrentodds(market_id, market_name);
    if (!current_odds || !current_odds.sports || current_odds.sports.length === 0) {
        return 'Bet is not acceptable. Odds not found';
    }
    // Add the rest of the logic here...
}

async function checkFancyOddsConditions(match_id, selection_id, is_back, odds, selection_name) {
    const current_odds = await getcurrentfancyodds(match_id, selection_id);
    if (!current_odds || !current_odds.sports || current_odds.sports.length === 0) {
        return 'Bet is not acceptable. Odds not found';
    }
    // Add the rest of the logic here...
}

async function checkCasinoOddsConditions(game_code, selection_id, is_back, odds_check, stack) {
    const currentodds = await getcurrentCasinoodds(game_code, selection_id);
    if (!currentodds || !currentodds.data) {
        return "data Not found";
    }
    // Add the rest of the logic here...
}

// API Call Functions
async function getcurrentfancyodds(market_id, selection_id) {
    const url = `${superNodeUrl}get-single-session?MatchID=${market_id}&SelectionId=${selection_id}`;
    try {
        const response = await axios.get(url);
        return response.data;
    } catch (error) {
        console.error("Error:", error.response.status, error.response.data);
        return error({}, "Invalid Api Response");
    }
}

async function getcurrentCasinoodds(game_code, selection_id) {
    const url = `${casinoNodeUrl}get-single-market/${game_code}/${selection_id}`;
    try {
        const response = await axios.get(url);
        return response.data;
    } catch (error) {
        console.error("Error:", error.response.status, error.response.data);
        return error({}, "Invalid Api Response");
    }
}

async function getcurrentodds(market_id, type) {
    const url = `${superNodeUrl}get-odds-single?marketId=${market_id}`;
    try {
        const response = await axios.get(url);
        return response.data;
    } catch (error) {
        console.error("Error:", error.response.status, error.response.data);
        return error({}, "Invalid Api Response");
    }
}

// Main Bet Placement Function
async function placebet(betObj, userInfo) {
    const payload = JSON.parse(betObj);
    try {
        if ("stack" in payload) {
            const parentinfo = await get_user_info(userInfo.parentId);
            const matchInfo = await GetMatchInfo(payload);
            const balance = await get_user_balance(userInfo._id);

            const validationStatus = await validate_bet(payload, userInfo, balance, defaultSettings, matchInfo);
            if (validationStatus && validationStatus.message) {
                return JSON.stringify(error({}, validationStatus.notification));
            }

            const validateOdds = await checkAllOddsCondition(payload);
            if (validateOdds && validateOdds.message) {
                return JSON.stringify(error({}, validateOdds.notification));
            }

            const runners = await getMarketRunner(payload, matchInfo);
            const jsonObj = {
                sportId: payload.betOn !== 'CASINO' ? payload.eventId : 5000,
                userId: mongoose.Types.ObjectId(userInfo._id),
                userName: userInfo.username,
                betClickTime: new Date(),
                matchId: parseInt(payload.matchId),
                marketId: payload.marketId,
                selectionId: parseInt(payload.selectionId),
                selectionName: payload.selectionName,
                matchName: payload.matchName,
                odds: parseFloat(payload.odds),
                volume: payload.volume || 0,
                stack: parseFloat(payload.stack),
                pnl: parseFloat(payload.pnl),
                marketName: payload.marketName,
                isBack: payload.isBack,
                matchedDate: new Date(),
                matchedOdds: parseFloat(payload.odds),
                matchedInfo: "",
                userIp: payload.ipAddress,
                loss: parseFloat(payload.loss),
                parentStr: userInfo.parentStr || "",
                ratioStr: parentinfo.partnership[payload.eventId] || defaultRatio,
                bet_on: payload.marketName === "Fancy" ? BetOn.FANCY : payload.betOn === BetOn.CASINO ? BetOn.CASINO : BetOn.MATCH_ODDS,
                runners: runners,
                gtype: payload.gtype || "",
                C1: payload.C1 || "",
                C2: payload.C2 || "",
                C3: payload.C3 || "",
                fancystatus: payload.fancystatus || "",
                status: "pending",
                createdAt: new Date(),
                updatedAt: new Date(),
                parentNameStr: parentinfo.username,
                oppsiteVol: payload.oppsiteVol || "undefined",
            };

            if (payload.betOn !== BetOn.CASINO) {
                const exposer = await getexposerfunction(userInfo, false, jsonObj);
                if (exposer !== 'failed') {
                    const available_balance = balance.balance;
                    const casinoexposer = balance.casinoexposer || 0;
                    if (available_balance < (exposer + casinoexposer)) {
                        return JSON.stringify(error({}, "Max limit Exceed"));
                    }
                    const betInsert = await Bet.create(jsonObj);
                    const inserted_document = await Bet.findById(betInsert._id);
                    await Balances.updateOne({ userId: userInfo._id }, { $set: { exposer: exposer } });

                    const betList = await Bet.find({
                        userId: mongoose.Types.ObjectId(userInfo._id),
                        matchId: parseInt(payload.matchId),
                        status: 'pending',
                    });

                    const markets = await Market.find({ matchId: parseInt(payload.matchId) });
                    const profitlist = get_odds_profit(betList, markets);
                    const ex = exposer + (balance.casinoexposer || 0);

                    const data_to_serialize = {
                        message: "Place Bet Successfully",
                        error: false,
                        code: 200,
                        bet: inserted_document,
                        bets: betList,
                        exposer: ex,
                        profitlist: profitlist,
                    };
                    return JSON.stringify(data_to_serialize);
                } else {
                    return JSON.stringify(error({}, "Insufficient Balance"));
                }
            } else {
                const casinoexposer = await get_casino_exposer(userInfo, false, jsonObj);
                if (casinoexposer !== 'failed') {
                    const exposer = balance.exposer || 0;
                    const available_balance = balance.balance || 0;
                    if (available_balance < (exposer + casinoexposer)) {
                        return JSON.stringify(error({}, "Max limit Exceed"));
                    }
                    const betInsert = await Bet.create(jsonObj);
                    const inserted_document = await Bet.findById(betInsert._id);
                    await Balances.updateOne({ userId: userInfo._id }, { $set: { casinoexposer: casinoexposer } });

                    const betList = await Bet.find({
                        userId: mongoose.Types.ObjectId(userInfo._id),
                        matchId: parseInt(payload.matchId),
                        status: 'pending',
                        bet_on: BetOn.CASINO,
                    });

                    if (matchInfo.status === 0) {
                        return JSON.stringify(error({}, "Match Is Not In Play"));
                    }

                    const markets = matchInfo.event_data.market;
                    const profitlist = get_casino_odds_profit(betList, markets, matchInfo);
                    const ex = casinoexposer + (balance.exposer || 0);

                    const data_to_serialize = {
                        message: "Place Bet Successfully",
                        error: false,
                        code: 200,
                        bet: inserted_document,
                        bets: betList,
                        exposer: ex,
                        profitlist: profitlist,
                    };
                    return JSON.stringify(data_to_serialize);
                } else {
                    return JSON.stringify(error({}, "Exposer Issue"));
                }
            }
        } else {
            return JSON.stringify(error({}, "Invalid Data"));
        }
    } catch (e) {
        console.error(e);
        return JSON.stringify(error({}, "Invalid Data"));
    }
}

// Exposer Calculation Functions
async function getexposerfunction(user, update_status, current_bet) {
    try {
        const user_bets = await Bet.find({ status: 'pending', userId: mongoose.Types.ObjectId(user._id) });
        const event_ids = [...new Set(user_bets.map(bet => bet.matchId).concat(current_bet.matchId))];
        const complete_bet_list = user_bets.concat(current_bet);

        if (event_ids.length > 0) {
            const match_list = await Match.find({ matchId: { $in: event_ids } });
            const new_match_list = await Promise.all(match_list.map(async (item) => {
                const markets = await Market.find({ matchId: item.matchId });
                item.markets = markets;
                return item;
            }));

            let fancy_expo = 0;
            let main_expo = 0;

            for (const item of new_match_list) {
                const event_data = item.markets;
                if (event_data) {
                    for (const event_event of event_data) {
                        const bet_list = complete_bet_list.filter(bet =>
                            bet.matchId === item.matchId &&
                            bet.bet_on === BetOn.MATCH_ODDS &&
                            bet.marketId === event_event.marketId
                        );
                        const profit = get_match_odds_exposer(bet_list, item);
                        const expo_li = Object.values(profit).filter(val => val < 0);
                        main_expo += expo_li.length > 0 ? Math.abs(Math.min(...expo_li)) : 0;
                    }
                }

                const fancy_bet_list = complete_bet_list.filter(bet =>
                    bet.matchId === item.matchId &&
                    bet.bet_on === BetOn.FANCY
                );
                const fancypl = get_fancy_position(fancy_bet_list);
                fancy_expo += Object.values(fancypl).reduce((sum, val) => sum + Math.abs(val), 0);
            }

            const total_exposer = fancy_expo + main_expo;

            if (update_status) {
                await Balances.updateOne(
                    { userId: mongoose.Types.ObjectId(user._id) },
                    { $set: { exposer: total_exposer } },
                    { upsert: true }
                );
            }

            return total_exposer;
        } else {
            return 'failed';
        }
    } catch (e) {
        console.error(e);
        return 'failed';
    }
}

// Profit Calculation Functions
function get_odds_profit(bets, markets) {
    const odds_profit = {};
    // Add the logic here...
    return odds_profit;
}

function get_casino_odds_profit(bets, markets, match_info) {
    const odds_profit = {};
    // Add the logic here...
    return odds_profit;
}

// Entry Point
(async () => {
    await mongoose.connect('mongodb://localhost:27017/your_database', { useNewUrlParser: true, useUnifiedTopology: true });
    console.log("Connected to MongoDB");

    // Example usage
    const userInfo = await get_user_info("some_user_id");
    const betObj = JSON.stringify({
        // Your bet payload here
    });
    const result = await placebet(betObj, userInfo);
    console.log(result);
})();