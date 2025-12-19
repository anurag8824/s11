// import React, { useReducer } from 'react'
// import IMarket from '../../models/IMarket'
// import LFancy from '../../models/LFancy'
// import sportsService from '../../services/sports.service'
// import { useParams } from 'react-router-dom'
// import IMatch from '../../models/IMatch'
// import { IUserBetStake } from '../../models/IUserStake'
// import { useDispatch } from 'react-redux'
// import { betPopup, selectFancyType } from '../../redux/actions/bet/betSlice'
// import IBet from '../../models/IBet'
// import { setCurrentMatch } from '../../redux/actions/sports/sportSlice'
// import Score from './components/score'
// import { useWebsocketUser } from '../../context/webSocketUser'
// import { useAppSelector } from '../../redux/hooks'
// import { selectUserData } from '../../redux/actions/login/loginSlice'
// import { isMobile } from 'react-device-detect'
// import MatchDetail from './components/match-detail'
// import MatchDetailMobile from './components/match-detail-mobile'
// import axios from 'axios'
// import { RoleType } from '../../models/User'
// import authService from '../../services/auth.service'
// import { selectInitApp } from '../../redux/actions/common/commonSlice'
// import { typographyClasses } from '@mui/material'

// type MarketData = {
//   markets: IMarket[]
//   fancies: LFancy[]
//   currentMatch: IMatch
//   stake: IUserBetStake
// }

// const Odds = () => {
//   const [marketDataList, setMarketDataList] = React.useState<MarketData>({} as MarketData)
//   const [t10Channel, setT10Chanel] = React.useState<any>()
//   const [isTvShow, setIsTvShow] = React.useState<boolean>(false)
//   const userState = useAppSelector(selectUserData)
//   const { matchId } = useParams()
//   console.log(matchId,"matchid inn spots ")
//   const dispatch = useDispatch()
//   const selectFancyT = useAppSelector(selectFancyType)
//   const initApp = useAppSelector(selectInitApp)

//   const { socketUser } = useWebsocketUser()
//   React.useEffect(()=>{
//     const fancyadd =async()=>{
//       console.log("hello world")
//       try {
//        const res =await axios.post(`http://localhost:3010/api/add-new-fancy/${matchId}`)
//        console.log(res,"hello world")
//       } catch (error) {
//         console.log(error)
//       }
//     }

//     fancyadd();
    
//   },[matchId])

//   const fetchOddsDetail = async () => {
//     try {
//       axios
//         .all([
//           sportsService.getMatchById(matchId!),
//           sportsService.getMarketList(matchId!),
//           sportsService.getFancyList(matchId!),
//         ])
//         .then(
//           axios.spread((currentMatch, marketData, fancyData) => {
//             dispatch(setCurrentMatch(currentMatch.data.data.match))
//             setMarketDataList({
//               currentMatch: currentMatch.data.data.match,
//               fancies: fancyData.data.data,
//               markets: marketData.data.data.markets,
//               stake: currentMatch.data.data.stake,
//             })
//           }),
//         )
//     } catch (error) {
//       console.log(error)
//       fetchOddsDetail()
//     }
//   }

//   React.useEffect(() => {
//     return () => {
//       dispatch(betPopup({ isOpen: false, betData: {} as IBet }))
//     }
//   }, [])

//   React.useEffect(() => {
//     if (initApp.event) {
//       sportsService
//         .getFancyList(matchId!, selectFancyT)
//         .then((fancyData) => {
//           // setMarketDataList({ ...marketDataList, fancies: fancyData.data.data })
//         })
//         .catch((e) => console.log(e.message))
//     }
//   }, [initApp])

//   React.useEffect(() => {
//     fetchOddsDetail()
//   }, [matchId])

//   const fetchT10Stream = async () => {
//     if (currentMatch?.isT10) {
//       const resp = await authService.gett10Streams()
//       if (resp?.data) {
//         const dataFilter = resp?.data?.filter(
//           (Item: any) => parseInt(Item.gameId) == currentMatch?.matchId,
//         )
//         setT10Chanel(dataFilter?.[0]?.channel)
//       }
//     }
//   }

//   React.useEffect(() => {
//     ; (async () => {
//       if (selectFancyT && Object.keys(marketDataList).length > 0) {
//         const fancyData = await sportsService.getFancyList(matchId!, selectFancyT)
//         setMarketDataList({ ...marketDataList, fancies: fancyData.data.data })
//       }
//     })()
//   }, [selectFancyT])

//   React.useEffect(() => {
//     if (userState.user._id) {
//       socketUser.emit('joinRoomMatchIdWUserId', `${userState.user._id}-${matchId}`)
//       socketUser.on('connect', () => {
//         socketUser.emit('joinRoomMatchIdWUserId', `${userState.user._id}-${matchId}`)
//       })
//     }
//   }, [userState.user])

//   React.useEffect(() => {
//     fetchT10Stream()
//   }, [marketDataList])

//   const scoreBoard = () => {
//     if (currentMatch && currentMatch.sportId == '4333')
//       return <Score matchId={currentMatch?.matchId} isT10={currentMatch?.isT10 || false} />
//     else if (currentMatch)
//       return (
//         <iframe
//           style={{ width: '100%', height: 'auto' }}
//           src={`https://score.hr08bets.in/api?eventid=${currentMatch?.matchId}`}
//         ></iframe>
//       )
//   }

//   const t10Tv = (height: string) => {
//     if (currentMatch && currentMatch.isT10)
//       return (
//         <div className='t10-iframe'>
//           <iframe
//             style={{ height: `${height}px` }}
//             src={`https://alpha-n.qnsports.live/route/rih.php?id=${t10Channel}`}
//           ></iframe>
//         </div>
//       )
//     else <div></div>
//   }

//   const otherTv = () => {
//     const tvUrl =
//       currentMatch && currentMatch.sportId == '4'
//         ? 'https://hr08bets.in/sports-stream-live/index.html?eventid='
//         : 'https://hr08bets.in/sports-stream-live/index.html?eventid='
//     return (
//       !currentMatch?.isT10 && (
//         <div className='card m-b-10' style={{ border: '0px none' }}>
//           {!isMobile ? (
//             <div className='card-header'>
//               <h6 onClick={() => setIsTvShow(!isTvShow)} className='card-title'>
//                 Live Match
//                 <span className='float-right'>
//                   <i className='fa fa-tv' /> live stream started
//                 </span>
//               </h6>
//             </div>
//           ) : (
//             ''
//           )}
//           {!isMobile && isTvShow && (
//             <div className='card-body p0'>
//               <iframe
//                 style={{ width: '100%', height: '250px' }}
//                 src={`${tvUrl}${currentMatch?.matchId}`}
//                 // src={`https://playg3.livestream11.com/user/526414545/unknown/27.0.178.13/c590458e-6d81-450e-8a6d-119bc2234267`}

//               ></iframe>
//               LIVE TV 
//             </div>
//           )}
//           {isMobile && (
//             <div className='card-body p0'>
//               <iframe
//                 style={{ width: '100%', height: '250px' }}
//                 src={`${tvUrl}${currentMatch?.matchId}`}
//               ></iframe>
//             </div>
//           )}
//         </div>
//       )
//     )
//   }
//   const { currentMatch, markets, fancies } = marketDataList

//   return !isMobile || (isMobile && userState?.user?.role != RoleType.user) ? (
//     <MatchDetail
//       currentMatch={currentMatch}
//       fancies={fancies}
//       scoreBoard={scoreBoard}
//       marketDataList={marketDataList}
//       matchId={matchId}
//       markets={markets}
//       t10Tv={t10Tv}
//       otherTv={otherTv}
//     />
//   ) : (
//     <MatchDetailMobile
//       currentMatch={currentMatch}
//       fancies={fancies}
//       scoreBoard={scoreBoard}
//       marketDataList={marketDataList}
//       matchId={matchId}
//       t10Tv={t10Tv}
//       markets={markets}
//       otherTv={otherTv}
//     />
//   )
// }
// export default React.memo(Odds)


import React, { useReducer } from 'react'
import IMarket from '../../models/IMarket'
import LFancy from '../../models/LFancy'
import sportsService from '../../services/sports.service'
import { useParams } from 'react-router-dom'
import IMatch from '../../models/IMatch'
import { IUserBetStake } from '../../models/IUserStake'
import { useDispatch } from 'react-redux'
import { betPopup, selectFancyType } from '../../redux/actions/bet/betSlice'
import IBet from '../../models/IBet'
import { setCurrentMatch } from '../../redux/actions/sports/sportSlice'
import Score from './components/score'
import { useWebsocketUser } from '../../context/webSocketUser'
import { useAppSelector } from '../../redux/hooks'
import { selectUserData } from '../../redux/actions/login/loginSlice'
import { isMobile } from 'react-device-detect'
import MatchDetail from './components/match-detail'
import MatchDetailMobile from './components/match-detail-mobile'
import axios from 'axios'
import { RoleType } from '../../models/User'
import authService from '../../services/auth.service'
import { selectInitApp } from '../../redux/actions/common/commonSlice'
import { typographyClasses } from '@mui/material'

type MarketData = {
  markets: IMarket[]
  fancies: LFancy[]
  currentMatch: IMatch
  stake: IUserBetStake
}

const Odds = () => {
  const [marketDataList, setMarketDataList] = React.useState<MarketData>({} as MarketData)
  const [t10Channel, setT10Chanel] = React.useState<any>()
  const [isTvShow, setIsTvShow] = React.useState<boolean>(false)
  const userState = useAppSelector(selectUserData)
  const { matchId } = useParams()
  console.log(matchId,"matchid inn spots ")
  const dispatch = useDispatch()
  const selectFancyT = useAppSelector(selectFancyType)
  const initApp = useAppSelector(selectInitApp)

  const { socketUser } = useWebsocketUser()
  // React.useEffect(()=>{
  //   const fancyadd =async()=>{
  //     console.log("hello world")
  //     try {
  //      const res =await axios.post(`http://localhost:3010/api/add-new-fancy/${matchId}`)
  //      console.log(res,"hello world")
  //     } catch (error) {
  //       console.log(error)
  //     }
  //   }

  //   fancyadd();
    
  // },[matchId])

  const fetchOddsDetail = async () => {
    try {
      axios
        .all([
          sportsService.getMatchById(matchId!),
          sportsService.getMarketList(matchId!),
          sportsService.getFancyList(matchId!),
        ])
        .then(
          axios.spread((currentMatch, marketData, fancyData) => {
            dispatch(setCurrentMatch(currentMatch.data.data.match))
            setMarketDataList({
              currentMatch: currentMatch.data.data.match,
              fancies: fancyData.data.data,
              markets: marketData.data.data.markets,
              stake: currentMatch.data.data.stake,
            })
          }),
        )
    } catch (error) {
      console.log(error)
      fetchOddsDetail()
    }
  }

  React.useEffect(() => {
    return () => {
      dispatch(betPopup({ isOpen: false, betData: {} as IBet }))
    }
  }, [])

  React.useEffect(() => {
    if (initApp.event) {
      sportsService
        .getFancyList(matchId!, selectFancyT)
        .then((fancyData) => {
          // setMarketDataList({ ...marketDataList, fancies: fancyData.data.data })
        })
        .catch((e) => console.log(e.message))
    }
  }, [initApp])

  React.useEffect(() => {
    fetchOddsDetail()
  }, [matchId])

  const fetchT10Stream = async () => {
    if (currentMatch?.isT10) {
      const resp = await authService.gett10Streams()
      if (resp?.data) {
        const dataFilter = resp?.data?.filter(
          (Item: any) => parseInt(Item.gameId) == currentMatch?.matchId,
        )
        setT10Chanel(dataFilter?.[0]?.channel)
      }
    }
  }

  React.useEffect(() => {
    ; (async () => {
      if (selectFancyT && Object.keys(marketDataList).length > 0) {
        const fancyData = await sportsService.getFancyList(matchId!, selectFancyT)
        setMarketDataList({ ...marketDataList, fancies: fancyData.data.data })
      }
    })()
  }, [selectFancyT])

  React.useEffect(() => {
    if (userState.user._id) {
      socketUser.emit('joinRoomMatchIdWUserId', `${userState.user._id}-${matchId}`)
      socketUser.on('connect', () => {
        socketUser.emit('joinRoomMatchIdWUserId', `${userState.user._id}-${matchId}`)
      })
    }
  }, [userState.user])

  React.useEffect(() => {
    fetchT10Stream()
  }, [marketDataList])

  const scoreBoard = () => {
    if (currentMatch && currentMatch.sportId == '4333')
      return <Score matchId={currentMatch?.matchId} isT10={currentMatch?.isT10 || false} />
    else if (new Date(currentMatch?.matchDateTime).getTime() < new Date().getTime() && !String(currentMatch?.matchId).startsWith('1313'))
      return (
        <iframe
          style={{ width: '100%', height: 'auto' }}
          // src={`https://card.hr08bets.in/api/getScoreData?event_id=${currentMatch?.matchId}`}
          src={`https://score.akamaized.uk/?id=${currentMatch?.matchId}`}
        ></iframe>
      )
  }

  const t10Tv = (height: string) => {
    if (currentMatch && currentMatch.isT10)
      return (
        <div className='t10-iframe'>
          <iframe
            style={{ height: `${height}px` }}
            src={`https://alpha-n.qnsports.live/route/rih.php?id=${t10Channel}`}
          ></iframe>
        </div>
      )
    else <div></div>
  }

  const otherTv = () => {
    const tvUrl =
      currentMatch && currentMatch.sportId == '4'
        ? 'https://hr08bets.in/sports-stream-live/index.html?eventid='
        : 'https://hr08bets.in/sports-stream-live/index.html?eventid='
    return (
      !currentMatch?.isT10 && (
        <div className='card m-b-10' style={{ border: '0px none' }}>
          {!isMobile && new Date(currentMatch?.matchDateTime).getTime() < new Date().getTime()  && !String(currentMatch?.matchId).startsWith('1313') && (
            <div className='card-header'>
              <h6 onClick={() => setIsTvShow(!isTvShow)} className='card-title'>
                Live Match
                <span className='float-right'>
                  <i className='fa fa-tv' /> live stream started
                </span>
              </h6>
            </div>
          )}
          {!isMobile && isTvShow && new Date(currentMatch?.matchDateTime).getTime() < new Date().getTime() && !String(currentMatch?.matchId).startsWith('1313') && (
            <div className='card-body p0'>
              <iframe
                style={{ width: '100%', height: '250px' }}
                // src={`${tvUrl}${currentMatch?.matchId}`}
                // src={`https://playg3.livestream11.com/user/526414545/unknown/27.0.178.13/c590458e-6d81-450e-8a6d-119bc2234267`}
                src={`https://livestream-v3-iframe.akamaized.uk/?eventid=${currentMatch?.matchId}`}
                
              ></iframe>
              LIVE TV 
            </div>
          )}
          {isMobile && new Date(currentMatch?.matchDateTime).getTime() < new Date().getTime() && !String(currentMatch?.matchId).startsWith('1313') && (
            <div className='card-body p0'>
              <iframe
                style={{ width: '100%', height: '250px' }}
                // src={`${tvUrl}${currentMatch?.matchId}`}
                // src={`https://score.hr08bets.in/api?eventid=${currentMatch?.matchId}`}
                src={`https://livestream-v3-iframe.akamaized.uk/?eventid=${currentMatch?.matchId}`}
              ></iframe>
          
            </div>
          )}
        </div>
      )
    )
  }
  const { currentMatch, markets, fancies } = marketDataList

  console.log(currentMatch , markets , fancies ,"cjhbshjdbjfsbjdjfsjdfjhsbjdfgbhjsd" )

  return !isMobile || (isMobile && userState?.user?.role != RoleType.user) ? (
    <MatchDetail
      currentMatch={currentMatch}
      fancies={fancies}
      scoreBoard={scoreBoard}
      marketDataList={marketDataList}
      matchId={matchId}
      markets={markets}
      t10Tv={t10Tv}
      otherTv={otherTv}
    />
  ) : (
    <MatchDetailMobile
      currentMatch={currentMatch}
      fancies={fancies}
      scoreBoard={scoreBoard}
      marketDataList={marketDataList}
      matchId={matchId}
      t10Tv={t10Tv}
      markets={markets}
      otherTv={otherTv}
    />
  )
}
export default React.memo(Odds)

