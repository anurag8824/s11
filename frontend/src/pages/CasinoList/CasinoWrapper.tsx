import React, { MouseEvent, useState } from "react";
import { useNavigateCustom } from "../_layout/elements/custom-link";
import MyBetComponent from "../odds/components/my-bet.component";
import { useParams } from "react-router-dom";
// import SoRules from './component/_common/Rules/SoRules'
import CasinoRulesDetail from "./CasinoRulesDetail";
import casinoService from "../../services/casino.service";
import { useDispatch } from "react-redux";
import { setCasinoCurrentMatch } from "../../redux/actions/casino/casinoSlice";
import LuckSeven from "./component/LuckSeven";
import CasinoQueenLayout from "./component/casinoQueen/CasinoQueenLayout";
import AaaCasino from "./component/AaaCasino";
import BollywoodCasino from "./component/BollywoodCasino";
import PlaceBetBox from "../odds/components/place-bet-box";
import IMarket from "../../models/IMarket";
import { IUserBetStake } from "../../models/IUserStake";
import userService from "../../services/user.service";
import LastResults from "./component/LastResults";
import Baccarat from "./component/Baccarat";
import Card32A from "./component/Card32A";
import DragonTigerA from "./component/dragonTigerA";
import OneDayTeen from "./component/onDayTeen";
import CasinoTitle from "./component/CasinoTitle";
import CasinoTimer from "./CasinoTimer";
import Onedaypoker from "./component/Onedaypoker";
import Twentydaypoker from "./component/Twentydaypoker";
import { isMobile } from "react-device-detect";

import { Tab, Tabs } from "react-bootstrap";
import {
  betPopup,
  selectBetCount,
  selectBetPopup,
  setBetCount,
  setbetlist,
  setBookMarketList,
} from "../../redux/actions/bet/betSlice";
import { useAppSelector } from "../../redux/hooks";
import OnedaypokerRules from "./component/_common/Rules/Onedaypoker";
import Dtl20Layout from "./component/dtl20";
import Dragontiger1Day from "./component/dragontiger1Day";
import TeenPatti20 from "./component/teen20";
import Cmeter20 from "./component/cmeter20";
import Sixplayerpoker from "./component/sixplayerpoker";
import Race20 from "./component/race20";
import TestTp from "./component/testtp";
import Card3JLayout from "./component/card3j";
import SoRules from "./component/_common/Rules/SoRules";
import OpenTeen from "./component/openTeen";
import SuperOver from "./component/superOver";
import Score from "./component/_common/score";
import Openteenpatti from "./component/_common/Rules/Openteenpatti";
import Cricketv from "./component/_common/Rules/Crickettv";
import TwentyCricket from "./component/20Cricket";
import { calculateTotalNumbersFromString } from "../../utils/helper";
import { toast } from "react-toastify";
import Card32B from "./component/Card32B";
import Casinowar from "./component/casinowar";
import AndarBhar from "./component/andarBhar";
import AndarBhar2 from "./component/andarBhar2";
import T20 from "./component/_common/Rules/T20";
import CricketVideoPopup20 from "./component/20CricketVideoPopup";
import Instantworli from "./component/instantworli";
import Worli from "./component/worli";
import { selectUserData } from "../../redux/actions/login/loginSlice";
import { useWebsocketUser } from "../../context/webSocketUser";
import axios from "axios";
// import datajson from './Casinojson'

// const isMobile = true;

type MarketData = {
  markets: IMarket[];
  stake: IUserBetStake;
};
const CasinoWrapper = (props: any) => {
  const navigate = useNavigateCustom();
  const [rulesModel, setRulesModel] = React.useState<boolean>(false);
  const [casinoMatchData, setCasinoMatchData] = React.useState<any>({} as any);
  // const { gameCode:string } = useParams()
  const { gameCode } = useParams<{ gameCode?: any }>();
  const dispatch = useDispatch();
  const [liveMatchData, setLiveMatchData] = React.useState<any>({} as any);
  const [marketDataList, setMarketDataList] = React.useState<MarketData>(
    {} as MarketData
  );
  const [updateOdds, setUpdateOdds] = React.useState<any>(undefined);
  const betValues = useAppSelector(selectBetPopup);
  const userState = useAppSelector(selectUserData);
  const { socketUser } = useWebsocketUser();

  const [checkRoundIdChange, setCheckRoundIdChange] = useState("");

  let interValCasino: any = null;
  ///const [interVal, setIntervalObj] = React.useState<any>(null)
  const betCount = useAppSelector(selectBetCount);
  const showRules = () => {
    setRulesModel(true);
  };
  const showAllBet = (e: MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();
    navigate.go("/unsettledbet");
  };
  React.useEffect(() => {
    if (userState.user._id) {
      socketUser.emit(
        "joinRoomMatchIdWUserId",
        `${userState.user._id}-${parseInt(casinoMatchData?.match_id)}`
      );
      socketUser.on("connect", () => {
        socketUser.emit(
          "joinRoomMatchIdWUserId",
          `${userState.user._id}-${parseInt(casinoMatchData?.match_id)}`
        );
      });
    }
  }, [userState.user, casinoMatchData?.match_id]);
  // if(casinoMatchData){
  //   return(
  //     <div>data is loading .....</div>
  //   )
  // }

  const getMatchLiveInfoInterval = async () => {
    /// const ref = useRef();
    casinoService.getLiveCasinoData(gameCode).then((res) => {
      // console.log(res,"responseis here")
      const fullMarketData = res?.data?.data;
      console.log(res?.data,"fullMarketData")
      if (casinoMatchData?.match_id != fullMarketData?.match_id) {
        // dispatch(betPopup({ isOpen: false, betData: { ...betValues.betData, stack: 0, pnl: 0 } }))
        dispatch(setBookMarketList({}));
        setLiveMatchData(fullMarketData);
        dispatch(setCasinoCurrentMatch(res?.data));
      }
      setCasinoMatchData(fullMarketData);
      const liveMarket = fullMarketData?.event_data;

      // console.log(liveMarket,"live event data")
      const run: any = {};

      if (liveMarket?.market?.length > 0) {
        liveMarket?.market?.map((m: any) =>
          m?.Runners?.map((r: any) => {
            const data: any = { ...r };
            data["MarketName"] = m.MarketName;
            data["mid"] = fullMarketData?.match_id;
            run[r?.sid || r?.sectionId] = data;
          })
        );
      }
      run["market"] = liveMarket?.market;
      run["desc"] = fullMarketData?.desc;

      run["cardsstring"] = fullMarketData?.cards;
      run["cards"] = {
        C1: fullMarketData?.C1,
        C2: fullMarketData?.C2,
        C3: fullMarketData?.C3,
        C4: fullMarketData?.C4,
        C5: fullMarketData?.C5,
        C6: fullMarketData?.C6,
        C7: fullMarketData?.C7,
        C8: fullMarketData?.C8,
        C9: fullMarketData?.C9,
        C10: fullMarketData?.C10,
        C11: fullMarketData?.C11,
        C12: fullMarketData?.C12,
        C13: fullMarketData?.C13,
        C14: fullMarketData?.C14,
        C15: fullMarketData?.C15,
        C16: fullMarketData?.C16,
        C17: fullMarketData?.C17,
      };
      setUpdateOdds(run);
    });
  };

  const getMatchLiveInfo = async () => {
    casinoService.getCasinoDataById(gameCode).then((res) => {
      if (res?.data?.data?.isDisable) {
        toast.warn("This game is suspended by admin, please try again later");
        return navigate.go("/");
      }
    });

    casinoService.getLiveCasinoData(gameCode).then((res) => {
      if (res?.data?.data?.isDisable) {
        toast.warn("This game is suspended by admin, please try again later");
        return navigate.go("/");
      }
      setCasinoMatchData(res?.data?.data);
      setLiveMatchData(res?.data?.data);
      dispatch(setCasinoCurrentMatch(res?.data?.data));
    });
  };

  React.useEffect(() => {
    if (updateOdds && updateOdds["1"]) {
      if (updateOdds["1"].mid != checkRoundIdChange)
        setCheckRoundIdChange(updateOdds["1"].mid);
    }
  }, [updateOdds, checkRoundIdChange]);

  React.useEffect(() => {
    if (!interValCasino && gameCode)
      interValCasino = setInterval(getMatchLiveInfoInterval, 900);
    return () => {
      clearInterval(interValCasino);
    };
  }, [gameCode, casinoMatchData]);

  // gameCode, casinoMatchData

  React.useEffect(() => {
    if (gameCode) getMatchLiveInfo();
    getUserStake();
    return () => {
      dispatch(setCasinoCurrentMatch({}));
      dispatch(setbetlist([] as any));
      dispatch(setBookMarketList({}));
      dispatch(setBetCount(0));
      //setIntervalObj(null)
    };
  }, [gameCode]);

  const getUserStake = () => {
    userService
      .getUserStake()
      .then((res) => {
        setMarketDataList({
          markets: [],
          stake: res.data.data.userStake,
        });
      })
      .catch((e) => {
        const error = e.response.data.message;
      });
  };
  const oneDayPokerDescription = (descript: string) => {
    const splitDesc = descript && descript != "" ? descript.split("##") : [];
    return (
      <div className="video-overlay-new right">
        <div className="winnertext mbc-5">
          <span className="tx-green">Winner</span> :{" "}
          {splitDesc?.length >= 0 && splitDesc[0]}j
        </div>
        <div className="playeratexta mbc-5">
          {" "}
          <span className="tx-yello">A</span> :{" "}
          {splitDesc?.length >= 1 && splitDesc[1]}
        </div>
        <div className="playeratextb">
          <span className="tx-red">B</span> :{" "}
          {splitDesc?.length >= 2 && splitDesc[2]}
        </div>
      </div>
    );
  };
  const race2020Mobile = () => {
    const cardExtra = casinoMatchData?.desc
      ?.split(",")
      .filter((Item: string) => Item != "1");
    return (
      <span className="float-right">
        Total Card: {cardExtra && cardExtra.length} Total Point:{" "}
        {cardExtra && cardExtra.length > 0
          ? calculateTotalNumbersFromString(cardExtra.join(","))
          : 0}
      </span>
    );
  };
  const renderUiData = (gamecode: any) => {
    switch (gamecode) {
      case "queen":
        return (
          <CasinoQueenLayout
            lastOdds={updateOdds}
            liveMatchData={liveMatchData}
          />
        );
      case "lucky7eu":
      case "lucky7":
        return (
          <LuckSeven lastOdds={updateOdds} liveMatchData={liveMatchData} />
        );
      case "dt20":
      case "dt202":
        return (
          <DragonTigerA lastOdds={updateOdds} liveMatchData={liveMatchData} />
        );
      case "AAA":
        return (
          <AaaCasino lastOdds={updateOdds} liveMatchData={liveMatchData} />
        );
      case "ddb":
        return (
          <BollywoodCasino
            lastOdds={updateOdds}
            liveMatchData={liveMatchData}
          />
        );
      case "teen":
        return (
          <OneDayTeen lastOdds={updateOdds} liveMatchData={liveMatchData} />
        );
      case "baccarat":
      case "baccarat2":
        return <Baccarat lastOdds={updateOdds} liveMatchData={liveMatchData} />;
      case "poker6":
        return (
          <Sixplayerpoker lastOdds={updateOdds} liveMatchData={liveMatchData} />
        );
      case "Superover":
      case "fivewicket":
        return (
          <SuperOver lastOdds={updateOdds} liveMatchData={liveMatchData} />
        );
      case "card32":
        return <Card32A lastOdds={updateOdds} liveMatchData={liveMatchData} />;
      case "race2020":
        return <Race20 lastOdds={updateOdds} liveMatchData={liveMatchData} />;
      case "cricket2020":
        return (
          <TwentyCricket
            checkRoundIdChange={checkRoundIdChange}
            lastOdds={updateOdds}
            liveMatchData={liveMatchData}
          />
        );
      case "cmeter2020":
        return <Cmeter20 lastOdds={updateOdds} liveMatchData={liveMatchData} />;
      case "card32b":
        return <Card32B lastOdds={updateOdds} liveMatchData={liveMatchData} />;
      case "poker":
        return (
          <Onedaypoker lastOdds={updateOdds} liveMatchData={liveMatchData} />
        );
      case "onedaypoker20":
        return (
          <Twentydaypoker lastOdds={updateOdds} liveMatchData={liveMatchData} />
        );
      case "teen8":
        return <OpenTeen lastOdds={updateOdds} liveMatchData={liveMatchData} />;
      case "testtp":
        return <TestTp lastOdds={updateOdds} liveMatchData={liveMatchData} />;
      case "dragontiger1Day":
        return (
          <Dragontiger1Day
            lastOdds={updateOdds}
            liveMatchData={liveMatchData}
          />
        );
      case "Cards3J":
        return (
          <Card3JLayout lastOdds={updateOdds} liveMatchData={liveMatchData} />
        );
      case "dtl20":
        return (
          <Dtl20Layout lastOdds={updateOdds} liveMatchData={liveMatchData} />
        );
      case "warcasino":
        return (
          <Casinowar lastOdds={updateOdds} liveMatchData={liveMatchData} />
        );
      case "Andarbahar":
        return (
          <AndarBhar lastOdds={updateOdds} liveMatchData={casinoMatchData} />
        );
      case "Andarbahar2":
        return (
          <AndarBhar2 lastOdds={updateOdds} liveMatchData={liveMatchData} />
        );
      case "teen20":
        return (
          <TeenPatti20 lastOdds={updateOdds} liveMatchData={liveMatchData} />
        );
      case "worlimatka":
        return <Worli lastOdds={updateOdds} liveMatchData={liveMatchData} />;
      case "worliinstant":
        return (
          <Instantworli
            lastOdds={updateOdds}
            liveMatchData={liveMatchData}
            checkRoundIdChange={checkRoundIdChange}
          />
        );

      default:
        break;
    }
  };

  //
  //     'Queen': "https://diamond.igtechgaming.com/freecasino/tvop?id=Queen",
  //     'lucky7B': "https://diamond.igtechgaming.com/freecasino/tvop?id=lucky7B",
  //     'lucky7': "https://diamond.igtechgaming.com/freecasino/tvop?id=lucky7",
  //     'dt20': 'https://www.jaiysh.com/live/live_stream/dt20',
  //     'dt20b': 'https://www.jaiysh.com/live/live_stream/dt20b',
  //     'AAA': "https://diamond.igtechgaming.com/freecasino/tvop?id=AAA",
  //     'ddb': "https://diamond.igtechgaming.com/freecasino/tvop?id=ddb",
  //     "ab4": "https://diamond.igtechgaming.com/freecasino/tvop?id=ab4"
  // };

  // const getIframeUrl = (gameCode: string): string | null => {
  //     return tv_url_jaiysh[gameCode] || null; // Return the URL or null if not found
  // };
  // const iframe_url = getIframeUrl(gameCode);
  // console.log(liveMatchData, "liveMatchData");

  // console.log("dfgdsfsfssjkdhfglskdhfglsdhfgjshd")

  // React.useEffect(() => {
  //   axios
  //     .get("http://185.211.4.99:3000/iframe/lucky7") // Calls the backend API directly
  //     .then((response) => {
  //       console.log("Fetched Data:", response); // Logs response in the browser console
  //     })
  //     .catch((error) => {
  //       console.error("Error fetching frame URL:", error.response?.data || error.message);
  //     });
  // }, []);

  // console.log("dfgdsfsfssjkdhfglskdhfglsdhfgjshd")

  const gameIdMapmacc: Record<any , any> = {
    card32b: 3034,
    baccarat2: 3033,
    dt20: "fNq3T-BMmL1",
    lucky7B: 3032,
    Tp1Day: "fNq3T-XRnLu",
    race2020: 3036,
    teen20:"fNq3T-FVmT3",
    worli2: 3040,
    Cards3J: 3039,
    Dd: 3041,
    queen: 3037,
    warcasino: "fNq3T-TZOa3",
    cric: 3042,
    Andarbahar2: 3043,
    baccarat: 3044,
    cmatch20: 3045,
    cmeter2020: 3046,
    dtl20: "fNq3T-2qCsW",
    "test tp": 3048,
    teen8: 3049,
    poker6player: 3050,
    onedaypoker: 3051,
    onedaypoker20: 3052,
    abj: 3053,
    worli: 3054,
    card32: 3055,
    AAA: "fNq3T-wVNlm",
    aaa: "fNq3T-wVNlm",
    "dragon tiger 1 day": 3057,
    lucky7: "fNq3T-hBSZ8",
    dt20b:"fNq3T-cVhfT",
    Superover: 3060,
  };

  const gameIdMap: Record<any, any> = {
    card32b: "card32eu",
    baccarat2: "baccarat2",
    dt20: "dt20",
    lucky7B: "lucky7eu",
    Tp1Day: "teen",
    ddb:"btable",
    race2020: 3036,
    teen20: "teen20",
    worli2: "worli2",
    Cards3J: "3cardj",
    Dd: 3041,
    queen: "queen",
    warcasino: "war",
    cric: "cricketv3",
    Andarbahar2: "abj",
    Andarbahar: "ab20",
    baccarat: "baccarat",
    cmatch20: "cmatch20",
    cmeter2020: "cmeter",
    dtl20: "dtl20",
    testtp: "teen9",
    teen8: 3049,
    poker6player: "poker6",
    onedaypoker: "poker",
    onedaypoker20: "poker20",
    abj: "ab20",
    worli: "worli",
    card32: "card32",
    AAA: "aaa",
    "dragon tiger 1 day": "dt6",
    lucky7: "lucky7",
    dt20b: "dt202",
    Superover: "superover",
    opentp:"teen8",
    cricket2020:"cmatch20",
    fivewicket:"cricketv3",
  };

  const fortv: Record<any, any> = {
    testtp: "teen9",
    AAA:"aaa",
    ddb:"btable",
    dragontiger1Day:"dt6",
    onedaypoker20:"poker20",
    card32b:"card32eu",
    cmeter2020:"cmeter",
    Cards3J:"3cardj",
    Superover:"superover",
    fivewicket:"cricketv3",
    cricket2020:"cmatch20",
    race2020:"race20",
    warcasino:"war",
    Andarbahar:"ab20",
    Andarbahar2:"abj",
    worliinstant:"worli2",
    //other codes remain same
  }

  // Assume `gameCode` comes from API response
  // const gameCode: string | undefined = liveMatchData?.gameCode;

  const gameId = gameCode ? gameIdMap?.[gameCode] ?? null : null;

  const mappedCode = gameCode ? fortv?.[gameCode] ??  gameCode : gameCode; 

  return (
    <>
      {!isMobile ? (
        <div
          className={`row mtc-5 row5 casino-container-box ${
            gameCode === "cricket2020" ? "cc-20" : ""
          }`}
        >
          <div className="col-8 col-lg-8">
            <div className="card m-b-10 my-bet">
              <div className="card-header casino">
                <h6 className="card-title d-inline-block">
                  {liveMatchData?.title || ""}
                  <span
                    className="fw-12 text-underlin"
                    onClick={showRules}
                    style={{ marginLeft: "10px" }}
                  >
                    RULES
                  </span>
                  <span className="float-right">
                    Round ID: {casinoMatchData?.match_id} | Min:{" "}
                    {casinoMatchData?.min} | Max: {casinoMatchData?.max}
                  </span>
                </h6>
              </div>
              <div
                className={`card-body ${gameCode}`}
                style={{
                  padding: "0px",
                  position: "relative",
                  minHeight: "400px",
                }}
              >
                {!isMobile && casinoMatchData && casinoMatchData.scoreCard ? (
                  <Score scoreData={casinoMatchData.scoreCard} />
                ) : (
                  ""
                )}
                <div
                  style={{
                    padding: "0px",
                    position: "relative",
                    minHeight: "400px",
                    background: "#000",
                  }}
                >
                  
                  {liveMatchData && gameCode && (
                    <iframe
                      title="stream"
                      width="100%"
                      height={isMobile ? "220" : "420"}
                      style={{ border: "0px" }}
                      // src={casinoMatchData?.tv}
                      // src={`https://mac88-casino-stream.scoreswift.xyz/stream?stream_id=${gameId}`}

                      // src={`https://sfront.starrexch.me/casino-tv?id=${gameCode}`}
                      src={`https://time.starrexch.me/casino-tv?id=${mappedCode}`}

                    ></iframe>
                  )}
                  {/* <iframe src='https://diamond.igtechgaming.com/freecasino/tvop?id=lucky7' width="100%"></iframe> */}
                  {casinoMatchData && (
                    <CasinoTimer lastOdds={casinoMatchData} />
                  )}
                  {casinoMatchData && (
                    <CasinoTitle lastResult={casinoMatchData} />
                  )}
                  {(gameCode == "poker" && casinoMatchData?.desc != "") ||
                  (gameCode == "onedaypoker20" && casinoMatchData?.desc != "")
                    ? oneDayPokerDescription(casinoMatchData?.desc)
                    : ""}
                  {gameCode == "cricket2020" && (
                    <CricketVideoPopup20
                      data={updateOdds}
                      checkRoundIdChange={checkRoundIdChange}
                      betCount={betCount}
                    />
                  )}
                </div>
              </div>
            </div>
            <div
              className={`card-body ${gameCode}`}
              style={{ padding: "0px", position: "relative" }}
            >
              {renderUiData(gameCode)}

              {(liveMatchData?.remark != "" &&
                liveMatchData?.slug != "Superover" &&
                liveMatchData?.slug != "fivewicket") ||
              (liveMatchData?.event_data?.remark != "" &&
                liveMatchData?.slug != "Superover" &&
                liveMatchData?.slug != "fivewicket") ? (
                <div className="notice-casino-odds">
                  <div className="marqueeN">
                    <p>
                      {liveMatchData?.remark ||
                        liveMatchData?.event_data?.remark}
                    </p>
                  </div>
                </div>
              ) : (
                ""
              )}
            </div>
            {casinoMatchData?.id && (
              <LastResults lastResult={casinoMatchData} gameId={gameCode} />
            )}
          </div>
          <div className="col-4 col-lg-4">
            <div id="sidebar-right" className=" ">
              <div className="ps">
                <div className="sidebar-right-inner">
                  {marketDataList.stake && (
                    <PlaceBetBox stake={marketDataList.stake} />
                  )}
                  <div className="card m-b-10 my-bet">
                    <div className="card-header">
                      <h6 className="card-title d-inline-block">My Bet</h6>
                      <a
                        href="#"
                        onClick={showAllBet}
                        className="card-title d-inline-block float-right"
                      >
                        View All
                      </a>
                    </div>
                    <div className="card-body">
                      <MyBetComponent />
                    </div>
                  </div>
                  {gameCode == "poker" && <OnedaypokerRules />}
                  {gameCode == "Superover" && <SoRules />}
                  {gameCode == "teen8" && <Openteenpatti />}
                  {gameCode == "fivewicket" && <Cricketv />}
                  {gameCode == "teen20" && <T20 />}
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="prelative casino-container-box">
          <Tabs>
            <Tab eventKey="home" title="Game">
              <div className="card m-b-10 my-bet">
                <div className="card-header casino">
                  <h6 className="card-title d-inline-block">
                    {casinoMatchData?.title || ""}
                    {gameCode == "race2020" &&
                      casinoMatchData &&
                      race2020Mobile()}
                  </h6>
                </div>
                <div
                  className={`card-body ${gameCode}`}
                  style={{
                    padding: "0px",
                    position: "relative",
                    minHeight: isMobile ? "250" : "420",
                  }}
                >
                  <div
                    style={{
                      padding: "0px",
                      position: "relative",
                      minHeight: "250",
                      // background: '#000',
                    }}
                  >
                    {liveMatchData && gameCode && (
                      <iframe
                        title="stream"
                        width="100%"
                        height={isMobile ? "250" : "420"}
                        style={{ border: "0px" }}
                        // src={casinoMatchData?.tv}
                        //  src={`https://mac88-casino-stream.scoreswift.xyz/stream?stream_id=${gameId}`}

                        // src={`https://sfront.starrexch.me/casino-tv?id=${gameCode}`}

                        src={`https://time.starrexch.me/casino-tv?id=${mappedCode}`}

                        sandbox="allow-same-origin allow-scripts allow-popups allow-forms"
                        seamless
                      ></iframe>
                    )}

                    {/* <iframe src='https://diamond.igtechgaming.com/freecasino/tvop?id=lucky7' width="100%"></iframe> */}
                    {casinoMatchData && (
                      <CasinoTimer lastOdds={casinoMatchData} />
                    )}
                    {casinoMatchData && (
                      <CasinoTitle lastResult={casinoMatchData} />
                    )}
                    {casinoMatchData && casinoMatchData?.scoreCard ? (
                      <Score scoreData={casinoMatchData?.scoreCard} />
                    ) : (
                      ""
                    )}
                    {(gameCode == "poker" && casinoMatchData?.desc) ||
                    (gameCode == "onedaypoker20" && casinoMatchData?.desc)
                      ? oneDayPokerDescription(casinoMatchData.desc)
                      : ""}
                    {gameCode == "cricket2020" && (
                      <CricketVideoPopup20
                        data={updateOdds}
                        checkRoundIdChange={checkRoundIdChange}
                        betCount={betCount}
                      />
                    )}
                  </div>
                </div>
              </div>
              <div
                className={`card-body ${gameCode}`}
                style={{ padding: "0px", position: "relative" }}
              >
                {renderUiData(gameCode)}
                {(liveMatchData?.remark != "" && gameCode != "Cards3J") ||
                (liveMatchData?.event_data?.remark != "" &&
                  gameCode != "Cards3J") ? (
                  <div className="notice-casino-odds">
                    <div className="marqueeN">
                      <p>
                        {liveMatchData?.remark ||
                          liveMatchData?.event_data?.remark}
                      </p>
                    </div>
                  </div>
                ) : (
                  ""
                )}
              </div>
              {marketDataList.stake && (
                <PlaceBetBox stake={marketDataList.stake} />
              )}
              <LastResults lastResult={casinoMatchData} gameId={gameCode} />
              {gameCode == "poker" && <OnedaypokerRules />}
              {gameCode == "teen8" && <Openteenpatti />}
              {gameCode == "fivewicket" && <Cricketv />}
              {gameCode == "teen20" && <T20 />}
              {gameCode == "Superover" && <SoRules />}
            </Tab>
            <Tab eventKey="profile" title={`PLACED BET (${betCount})`}>
              <div className="card m-b-10 my-bet">
                <div className="card-header">
                  <h6 className="card-title d-inline-block">My Bet</h6>
                </div>
                <div className="card-body">
                  <MyBetComponent />
                </div>
              </div>
            </Tab>
          </Tabs>
          <div className="csmobileround">
            <span
              className="fw-12 text-underlin"
              onClick={showRules}
              style={{ marginLeft: "10px" }}
            >
              RULES
            </span>
            <span>Round ID: {casinoMatchData?.match_id}</span>
          </div>
        </div>
      )}
      {rulesModel ? (
        <CasinoRulesDetail
          title={casinoMatchData.title}
          gameId={gameCode}
          isOpen={rulesModel}
          setIsOpen={setRulesModel}
        />
      ) : (
        ""
      )}
    </>
  );
};
export default CasinoWrapper;
