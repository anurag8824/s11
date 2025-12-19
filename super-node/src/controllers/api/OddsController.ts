import { Request, Response } from "express";
import { redisReplica } from "../../database/redis";
import api from "../../utils/api";
import axios from "axios"

const fetchDataFromApi = async (EventID: any, sportId: any) => {
  try {
    const res = await axios.get(`http://195.110.59.236:3000/allMatchUsingSports/${sportId}`);
    const competitions = res?.data?.data?.t1 || [];
    console.log(competitions,"competitions")

    const fcompetitions = competitions.filter((match:any)=>match.gmid == EventID)

    // const matchedMarkets = competitions.flatMap((s: any) =>
    //   s.markets
    //     .filter((m: any) => m?.version ==EventID)
    //     .map((m: any) => ({
    //       seriesId: s.id,
    //       sportId: sportId,
    //       matchId: m.version,
    //       marketId: m.marketId,
    //       marketName: m.description.marketType,
    //       marketStartTime: m.marketStartTime,
    //       runners: [
    //         {
    //           selectionId: m.runners[0]?.selectionId,
    //           runnerName: m.runners[0]?.runnerName,
    //           handicap: m.runners[0]?.handicap,
    //           sortPriority: m.runners[0]?.sortPriority,
    //         },
    //         {
    //           selectionId: m.runners[1]?.selectionId,
    //           runnerName: m.runners[1]?.runnerName,
    //           handicap: m.runners[1]?.handicap,
    //           sortPriority: m.runners[1]?.sortPriority,
    //         },
    //       ],
    //       oddsType: m.description.bettingType,
    //     }))
    // );
    

    
    const matchedMarkets = fcompetitions.map((m: any) => ({
      seriesId: m.cid,
      sportId: sportId,
      matchId: m.gmid,
      marketId: m.mid,
      marketName: m.mname,
      marketStartTime: m.stime,
      runners: (m.section || []).map((r: any, index: number) => ({
        selectionId: r?.sid,
        runnerName: r?.nat,
        handicap: r?.handicap || null,
        sortPriority: r?.sortPriority ?? index,
      })),
      oddsType: m?.description?.bettingType || "Di",
    }));
    
    
    
    console.log(matchedMarkets, 'Filtered Market Data');
    return matchedMarkets;
  } catch (error) {
    console.error('Error fetching data:', error);
    return [];
  }
};

// const GetsessionFromApi = async (MatchId: any) => {
//   try {
//     const res = await axios.get(`http://69.62.123.205:7000/api/v/session?eventid=${MatchId}`);
//     const fancyData: any = res.data?.catalogues?.filter((p:any)=>
//       p.marketType !== "MATCH_ODDS" &&
//       p.marketType !== "The Draw" &&
//       p.marketType !== "BOOKMAKER"
//     ).map((f: any) => (
//       {
//         let gtype:any;
//         if(f.marketName.includes("ODD EVEN") || f.marketName.includes("odd evenn")){
//           gtype = oddeven
//         }else{
//           gtype = "session"
//         }
//       }
//       return{
//       matchId: MatchId,
//       SelectionId: f.marketId,
//       active: f.status === "OPEN",
//       ballbyBall: "",
//       RunnerName: f.marketName,
//       gtype: f.catagory =="SESSIONS" ? "session": f.catagory.toLowerCase(),
//       sportId: 4,
//       sr_no: 1,
//     }));
//     return fancyData;
//   } catch (error) {
//     console.error("Error in GetsessionFromApi:", error);
//     return [];
//   }
// };

// Book Maker data formatting 

const fetchBookMakerDataFromApi = async (EventID: any, sportId: any) => {
  try {
    const res = await axios.get(`http://195.110.59.236:3000/allMatchData/4/${EventID}`);
    console.log(res,"res is BookMaker")
    const d = res?.data?.data|| [];
   const c = d.filter((m:any) => m.mname == "Bookmaker")
    console.log(c,"competitions for BookMaker")
 
    const matchedMarkets = 
     
      [  {
          seriesId: c?.id || 321,
          sportId: sportId,
          matchId: EventID,
          marketId: c[0]?.mid,
          marketName: "Bookmaker",
          marketStartTime: c[0]?.marketStartTime || null,
          runners: (c[0].section || []).map((r: any,index:any) => ({
            selectionId: r?.sid,
            runnerName: r?.nat,
            handicap: r?.handicap || 0,
            sortPriority: r?.sortPriority || index,
            status:c[0]?.gstatus || ""
          })),
          oddsType: 'bookMaker',
        }]
    
    
    console.log(matchedMarkets[0].runners, 'Filtered Market Data');
    return matchedMarkets;
  } catch (error) {
    console.error('Error fetching data:', error);
    return [];
  }
};


const GetsessionFromApi = async (MatchId: any, sportId: any) => {
  try {
    const res = await axios.get(`http://195.110.59.236:3000/allMatchData/4/${MatchId}`);

    const fancyData: any = res.data?.data
      ?.filter((p: any) => 
        p.mname === "Normal" || p.mname === "fancy1" // fixed logical condition
        // p.marketType !== "BOOKMAKER" // uncomment if needed
      )
      ?.flatMap((f: any) =>
        (f.section || []).map((fa: any) => ({
          matchId: MatchId,
          SelectionId: fa.sid,
          active: f.status === "OPEN",
          ballbyBall: "",
          RunnerName: fa.nat,
          gtype: f.gtype,
          sportId: sportId, // now uses passed value instead of hardcoded 4
          sr_no: f.sno,
        }))
      );

    return fancyData;
  } catch (error) {
    console.error("Error in GetsessionFromApi:", error);
    return [];
  }
};




class OddsController {
  public static async getSports(
    req: Request,
    res: Response
  ): Promise<Response> {
    try {
      let competitionsData = [];
      const data = await redisReplica.get(`getSportList`);
      if (data) competitionsData = JSON.parse(data);

      // From api
      if (!data) {
        const res = await api.get(`/get-sports`);
        competitionsData = res.data.sports;
      }

      return res.json({
        sports: competitionsData,
      });
    } catch (e: any) {
      return res.json({
        sports: [],
        error: e.message,
      });
    }
  }
  public static getOdds = async (req: Request, res: Response): Promise<any> => {
    try {
      let { MarketID, marketId } = req.query;
      if (marketId) MarketID = marketId;
      if (!MarketID) throw Error("marketId is required field");

      let response: any = await redisReplica.get(`odds-market-${MarketID}`);
      response = response ? { data: JSON.parse(response) } : { data: [] };

      if (response.data && response.data.error) {
        return res.json({
          error: response.data.error,
        });
      }

      if (response.data && Object.keys(response.data).length > 0) {
        return res.json({
          sports: [response.data],
        });
      } else {
        return res.json({
          sports: [],
        });
      }
    } catch (e: any) {
      return res.json({
        error: e.message,
      });
    }
  };

  public static getMakerOddsSingle = async (
    req: Request,
    res: Response
  ): Promise<any> => {
    try {
      const { marketId } = req.query;
      if (!marketId) throw Error("marketId is required field");
      // console.log(marketId,"marketId is here")

      let response: any = await redisReplica.get(`odds-market-${marketId}`);

      response = response ? { data: JSON.parse(response) } : { data: [] };

      // console.log(response,"response data for odds bet")


      if (response.data && response.data.error) {
        return res.json({
          error: response.data.error,
        });
      }

      if (response.data) {
        return res.json({
          sports: response.data,
        });
      }
    } catch (e: any) {
      return res.json({
        error: e.message,
      });
    }
  };

  public static async getSingleSessionMarket(
    req: Request,
    res: Response
  ): Promise<Response> {
    try {
      const { MatchID, SelectionId }: any = req.query;
      if (!MatchID) throw Error("MatchID is required field");

      if (!SelectionId) throw Error("SelectionId is required field");

      let response: any = await redisReplica.get(`fancy-${MatchID}`);
      // console.log(response,"ghjkhjklbjk")

      response = response ? { data: JSON.parse(response) } : { data: [] };
      const market = response.data
        .filter((m: any) => m.SelectionId == SelectionId)
        .filter((m: any) => m.gtype === "session" || m.gtype === "fancy1");

      // /  console.log(market,"markets hahahahh")

      return res.json({
        sports: market,
      });
    } catch (e: any) {
      return res.json({
        error: e.message,
      });
    }
  }

  public static async getSeries(
    req: Request,
    res: Response
  ): Promise<Response> {
    try {
      const { EventTypeID } = req.query;
      if (!EventTypeID) throw Error("EventTypeID is required field");

      let competitionsData = [];
      const data = await redisReplica.get(`getCompetitions-${EventTypeID}`);
      if (data) competitionsData = JSON.parse(data);

      // From api
      if (!data) {
        const res = await api.get(`/get-series?EventTypeID=${EventTypeID}`);
        competitionsData = res.data.sports;
      }

      return res.json({
        sports: competitionsData,
      });
    } catch (e: any) {
      return res.json({
        sports: [],
        error: e.message,
      });
    }
  }

  public static async getMatchList(
    req: Request,
    res: Response
  ): Promise<Response> {
    try {
      const { EventTypeID, CompetitionID } = req.query;
      if (!EventTypeID) throw Error("EventTypeID is required field");
      if (!CompetitionID) throw Error("CompetitionID is required field");

      let matchList = [];

      const data = await redisReplica.get(
        `getMatchList-${EventTypeID}-${CompetitionID}`
      );
      if (data) matchList = JSON.parse(data);

      if (!data) {
        const res = await api.get(
          `/get-matches?EventTypeID=${EventTypeID}&CompetitionID=${CompetitionID}`
        );
        matchList = res.data.sports;
      }

      return res.json({
        sports: matchList,
      });
    } catch (e: any) {
      return res.json({
        sports: [],
        error: e.message,
      });
    }
  }

  public static async getMatchListT10(
    req: Request,
    res: Response
  ): Promise<Response> {
    try {
      let matchList: any = [];
      return res.json({
        sports: matchList,
      });

      // const data = await redisReplica.get(`getMatchList-T10`);
      // if (data) matchList = JSON.parse(data);

      // if (!data) {
      //   const res = await api.get(`/get-matches-t10`);
      //   matchList = res.data.sports;
      // }

      // return res.json({
      //   sports: matchList,
      // });
    } catch (e: any) {
      return res.json({
        sports: [],
        error: e.message,
      });
    }
  }

  public static async getMarketList(
    req: Request,
    res: Response
  ): Promise<Response> {
    try {
      const { EventID, sportId } = req.query;
      if (!EventID) throw Error("EventID is required field");
      if (!sportId) throw Error("sportId is required field");

      let matchList = [];
      if (req.originalUrl.includes("get-marketes-t10")) {
        const data = await redisReplica.get(`getMarketList-bm-${EventID}`);
        if (data) matchList = JSON.parse(data);
        if (!data) {
          const res = await api.get(
            `/get-marketes-t10?sportId=${sportId}&EventID=${EventID}`
          );
          matchList = res.data.sports;
        }
      } else if (req.originalUrl.includes("get-marketes")) {
        const data = await redisReplica.get(`getMarketList-${EventID}`);
        if (data) matchList = JSON.parse(data);
        if (!data) {
          const res = await api.get(
            `/get-marketes?sportId=${sportId}&EventID=${EventID}`
          );
          matchList = res.data.sports;
        }
      } else if (req.originalUrl.includes("get-bookmaker-marketes")) {
        const data = await redisReplica.get(`getMarketList-bm-${EventID}`);
        if (data) matchList = JSON.parse(data);
        if (!data) {
          const res = await api.get(
            `/get-bookmaker-marketes?sportId=${sportId}&EventID=${EventID}`
          );
          matchList = res.data.sports;
        }
      }

      return res.json({
        sports: matchList,
      });
    } catch (e: any) {
      return res.json({
        sports: [],
        error: e.message,
      });
    }
  }

//   public static async getMarketList(
//     req: Request,
//     res: Response
//   ): Promise<Response> {
//     try {
//       const { EventID, sportId } = req.query;
//       if (!EventID) throw Error("EventID is required field");
//       if (!sportId) throw Error("sportId is required field");

//       let matchList = [];
//       if (req.originalUrl.includes("get-marketes-t10")) {
//         const data = await redisReplica.get(`getMarketList-bm-${EventID}`);
//         if (data) matchList = JSON.parse(data);
//         if (!data) {
//           const res = await api.get(
//             `/get-marketes-t10?sportId=${sportId}&EventID=${EventID}`
//           );
//           matchList = res.data.sports;
//         }
//       } else if (req.originalUrl.includes("get-marketes")) {
//         // const data = await redisReplica.get(`getMarketList-${EventID}`);
//         const data :any =  await fetchDataFromApi(EventID,sportId)
//         console.log(data,"data here is data ")
//         // if (data) matchList = JSON.parse(data);
//         if (data.length == 0) {
//           const res = await api.get(
//             `/get-marketes?sportId=${sportId}&EventID=${EventID}`
//           );
//          return matchList = data;
//           // console.log(matchList,"matchList")
//         }
//         matchList = data;
//       } else if (req.originalUrl.includes("get-bookmaker-marketes")) {
//         const data = await fetchBookMakerDataFromApi(EventID,sportId)
//         // await redisReplica.get(`getMarketList-bm-${EventID}`);
//         if (data) matchList = data
//         console.log("Bookmaker data",data)
//         if (!data) {
//           const res = await api.get(
//             `/get-bookmaker-marketes?sportId=${sportId}&EventID=${EventID}`
//           );
//           matchList = res.data.sports;
//         }
//       }

//       return res.json({
//         sports: matchList,
//       });
//     } catch (e: any) {
//       return res.json({
//         sports: [],
//         error: e.message,
//       });
//     }
// }

  public static async getSessions(
    req: Request,
    res: Response
  ): Promise<Response> {
    try {
      const { MatchID } = req.query;
      if (!MatchID) throw Error("MatchID is required field");

      let matchList = [];
      const data = await redisReplica.get(`fancy-${MatchID}`);
      if (data) matchList = JSON.parse(data);
      if (req.originalUrl.includes("get-sessions-t10") && !data) {
        const res = await api.get(`/get-sessions-t10?MatchID=${MatchID}`);
        matchList = res.data.sports;
      } else if (req.originalUrl.includes("get-sessions") && !data) {
        const res = await api.get(`/get-sessions?MatchID=${MatchID}`);
        matchList = res.data.sports;
      }

      return res.json({
        sports: matchList,
      });
    } catch (e: any) {
      return res.json({
        sports: [],
        error: e.message,
      });
    }
  }

  // public static async fancyData(
  //   req: Request,
  //   res: Response
  // ): Promise<Response> {
  //   try {
  //     const { MatchID }: any = req.query;
  //     if (!MatchID) throw Error("MatchID is required field");

  //     // let response: any = await redisReplica.get(`fancy-${MatchID}`);
  //     let response :any = await axios.get(`http://185.211.4.99:3000/allMatchData/4/${MatchID}`)
  //     // response = response ? { data: JSON.parse(response) } : { data: [] };


  //     const data = response.map((item:any)=>{
  //       if(item.mname == "MATCH_ODDS"||item.mname  =="Bookmaker" ){
  //     }
  //   else{
  //      item?.section.map((i:any)=>{
  //       return{
  //         "BackPrice1":i.odds[0].odds,
  //         "BackPrice2":0,
  //        "BackPrice3":0,
  //         "LayPrice1":i.oods[1].odds,
  //         "LayPrice2":0,
  //         "LayPrice3":0,
  //         "BackSize1":i.odds[0].size,
  //         "BackSize2":0,
  //        "BackSize3":0,
  //         "LaySize1":i.odds[1].size,
  //         "LaySize2":0,
  //         "LaySize3":0,
  //         "RunnnerName":i.nat,
  //         "SelectionId":i.sid.toString(),
  //         "GameStatus": "",
  //         "gtstatus": i.gstatus,
  //         "max":i.max,
  //         "min":i.min,
  //         "rem":i.rem,
  //         "srno":i.sno.toString(),
  //         mname:item.mname
  //       }
  //      })
  //   }
  //   })

    


  //     return res.json({
  //       ...response,
  //       error: "",
  //     });
  //   } catch (e: any) {
  //     return res.json({
  //       error: e.message,
  //     });
  //   }
  // }


  // public static async fancyData(
  //   req: Request,
  //   res: Response
  // ): Promise<Response> {
  //   try {
  //     const { MatchID }: any = req.query;
  //     console.log(MatchID,"matchId for odds data")
  //     if (!MatchID) throw Error("MatchID is required field");
  
  //     // Fetch the data from the API
  //     let response: any = await axios.get(
  //       `http://185.211.4.99:3000/allMatchData/4/${MatchID}`
  //     );
  //     console.log(response,"response")
  
  //     // Use Promise.all to handle async processing of each section
  //     const data = await Promise.all(
  //       response.data.data.map(async (item: any) => {
  //         if (item.mname === "MATCH_ODDS" || item.mname === "Bookmaker") {
  //           // return item; // or handle logic here if necessary
  //         } else {
  //           // Process each section concurrently using Promise.all
  //           const sectionData = await Promise.all(
  //             item.section.map(async (i: any) => {
  //               return {
  //                 "BackPrice1": i?.odds[0]?.odds || 0,
  //                 "BackPrice2": 0,
  //                 "BackPrice3": 0,
  //                 "LayPrice1": i?.odds[1]?.odds ||0,
  //                 "LayPrice2": 0,
  //                 "LayPrice3": 0,
  //                 "BackSize1": i?.odds[0]?.size ||0,
  //                 "BackSize2": 0,
  //                 "BackSize3": 0,
  //                 "LaySize1": i?.odds[1]?.size  || 0,
  //                 "LaySize2": 0,
  //                 "LaySize3": 0,
  //                 "RunnnerName": i.nat,
  //                 "SelectionId": i.sid.toString(),
  //                 "GameStatus": "",
  //                 "gtstatus": i.gstatus,
  //                 "max": i.max,
  //                 "min": i.min,
  //                 "rem": i.rem,
  //                 "srno": i.sno.toString(),
  //                 mname: item.mname,
  //               };
  //             })
  //           );
  
  //           // Return the item with the processed section data
  //           return {data:sectionData} ;
  //         }
  //       })
  //     );

  //     console.log(data,"data for odds ")
  
  //     return res.json({
  //       data,
  //       error: "Hello world",
  //     });
  //   } catch (e: any) {
  //     return res.json({
  //       error: e.message,
  //     });
  //   }
  // }


//   public static async fancyData(
//     req: Request,
//     res: Response
// ): Promise<Response> {
//     try {
//         const { MatchID }: any = req.query;
//         console.log(MatchID, "matchId for odds data");
//         if (!MatchID) throw Error("MatchID is required field");

//         // Fetch the data from the API
//         let response: any = await axios.get(
//             `http://185.211.4.99:3000/allMatchData/4/${MatchID}`
//         );
//         console.log(response, "response");

//         // Use Promise.all to handle async processing of each section
//         const data = await Promise.all(
//             response.data.data.map(async (item: any) => {
//                 if (item.mname === "MATCH_ODDS" || item.mname === "Bookmaker") {
//                     // Skip processing for "MATCH_ODDS" or "Bookmaker" items
//                     return null; // You could also return an empty object or another placeholder
//                 } else {
//                     // Process each section concurrently using Promise.all
//                     const sectionData = await Promise.all(
//                         item.section.map(async (i: any) => {
//                             return {
//                                 "BackPrice1": i?.odds[0]?.odds || 0,
//                                 "BackPrice2": 0,
//                                 "BackPrice3": 0,
//                                 "LayPrice1": i?.odds[1]?.odds || 0,
//                                 "LayPrice2": 0,
//                                 "LayPrice3": 0,
//                                 "BackSize1": i?.odds[0]?.size || 0,
//                                 "BackSize2": 0,
//                                 "BackSize3": 0,
//                                 "LaySize1": i?.odds[1]?.size || 0,
//                                 "LaySize2": 0,
//                                 "LaySize3": 0,
//                                 "RunnnerName": i.nat,
//                                 "SelectionId": i.sid.toString(),
//                                 "GameStatus": "",
//                                 "gtstatus": i.gstatus,
//                                 "max": i.max,
//                                 "min": i.min,
//                                 "rem": i.rem,
//                                 "srno": i.sno.toString(),
//                                 mname: item.mname,
//                             };
//                         })
//                     );

//                     // Return the sectionData directly, no need to wrap it
//                     return sectionData;
//                 }
//             })
//         );

//         // Filter out any null values (items with "MATCH_ODDS" or "Bookmaker")
//         const filteredData = data.filter(item => item !== null);

//         console.log(filteredData, "filtered data for odds");

//         return res.json({
//             data: filteredData.flat(), // Flatten the array if you want a single-level array
//             error: null,
//         });
//     } catch (e: any) {
//         return res.json({
//             error: e.message,
//         });
//     }
// }

// public static async getSessions(
//   req: Request,
//   res: Response
// ): Promise<Response> {
//   try {
//     const { MatchID,sportId} = req.query;
//     if (!MatchID) throw Error("MatchID is required field");

//     let matchList = [];
//     // const data = await redisReplica.get(`fancy-${MatchID}`);
//     const data:any = await GetsessionFromApi(MatchID,sportId)
//     matchList = data;
//     // if (data) matchList = JSON.parse(data);
//     if (req.originalUrl.includes("get-sessions-t10") && data.length ==0) {
//       const res = await api.get(`/get-sessions-t10?MatchID=${MatchID}`);
//       matchList = res.data.sports;
//     } else if (req.originalUrl.includes("get-sessions") && data.length ==0) {
//       const res = await api.get(`/get-sessions?MatchID=${MatchID}`);
//        matchList = res.data.sports;
//     }

//     return res.json({
//       sports: matchList,
//     });
//   } catch (e: any) {
//     return res.json({
//       sports: [],
//       error: e.message,
//     });
//   }
// }

public static async fancyData(
  req: Request,
  res: Response
): Promise<Response> {
  try {
    const { MatchID }: any = req.query;
    if (!MatchID) throw Error("MatchID is required field");

    let response: any = await redisReplica.get(`fancy-${MatchID}`);
    // console.log(response,"response Hahahah")
    response = response ? { data: JSON.parse(response) } : { data: [] };

    return res.json({
      ...response,
      error: "",
    });
  } catch (e: any) {
    return res.json({
      error: e.message,
    });
  }
}

  

  public static getSeriesListRedis = async (
    req: Request,
    res: Response
  ): Promise<any> => {
    const { sportsId } = req.params;
    try {
      const seriesList: any = await redisReplica.get(
        `complete-match-list-${sportsId}`
      );
      return res.json({
        message: "Series Updated Successfully",
        data: JSON.parse(seriesList),
      });
    } catch (e: any) {
      return res.json({
        sports: [],
      });
    }
  };

  public static async getResults(
    req: Request,
    res: Response
  ): Promise<Response> {
    const { MarketID } = req.query;

    try {
      if (!MarketID) throw Error("MarketID is required field");

      const getDataFromBetFair = await api.get(
        `https://ero.betfair.com/www/sports/exchange/readonly/v1/bymarket?_ak=nzIFcwyWhrlwYMrh&alt=json&currencyCode=USD&locale=en_GB&marketIds=${MarketID}&rollupLimit=1&rollupModel=STAKE&types=MARKET_STATE,MARKET_RATES,MARKET_DESCRIPTION,EVENT,RUNNER_DESCRIPTION,RUNNER_STATE,RUNNER_EXCHANGE_PRICES_BEST,RUNNER_METADATA,MARKET_LICENCE,MARKET_LINE_RANGE_INFO,RUNNER_PRICE_TREND`
      );

      const data = getDataFromBetFair.data.eventTypes.map((events: any) => {
        return events.eventNodes
          .map((event: any) => {
            const marketData = event.marketNodes;
            return marketData.reduce((acc: any, market: any) => {
              const runners = market.runners.map((runner: any) => {
                return {
                  selectionId: runner.selectionId,
                  runner: runner.description.runnerName,
                  status: runner.state.status,
                  lastPriceTraded: 0,
                  ex: {
                    availableToBack: [],
                    availableToLay: [],
                  },
                  back: [],
                  lay: [],
                };
              });
              if (market.state.status === "CLOSED")
                acc.push({
                  eventid: event.eventId,
                  marketId: market.marketId,
                  market: market.description.marketName,
                  updateTime: market.description.marketTime,
                  status: market.state.status,
                  inplay: market.state.inplay,
                  totalMatched: 0,
                  active: true,
                  markettype: "ODDS",
                  runners,
                });

              return acc;
            }, []);
          })
          .flat();
      });

      return res.json({
        sports: data.flat(),
      });
    } catch (e: any) {
      return res.json({
        error: e.message,
      });
    }
  }

  public static async getOddsByRedis(
    req: Request,
    res: Response
  ): Promise<Response> {
    try {
      const { marketIds }: any = req.query;
      if (!marketIds) throw Error("marketIds is required field");

      const markets = marketIds.split(",");

      const marketResponses = markets.map(async (marketId: string) => {
        let response: any = await redisReplica.get(`odds-market-${marketId}`);
        return response ? JSON.parse(response) : null;
      });

      return Promise.all(marketResponses).then((odds) => {
        return res.json({
          odds,
        });
      });
    } catch (e: any) {
      return res.json({
        error: e.message,
      });
    }
  }
}
export default OddsController;
