/* eslint-disable @typescript-eslint/ban-ts-comment */
import React, { useEffect, useRef } from 'react'
import { useAppSelector } from '../../../redux/hooks'
import { selectCasinoCurrentMatch } from '../../../redux/actions/casino/casinoSlice'
import { calculateTotalNumbersFromString, replacecardstringSuperover } from '../../../utils/helper'
import { isMobile } from 'react-device-detect'

import PropTypes from 'prop-types'
import Carousel from 'react-elastic-carousel'
// import img from "/imgs/casino/cards/AHH.png"

const breakPoints: any = [
  { width: 1, itemsToShow: 4 },
  { width: 550, itemsToShow: 2, itemsToScroll: 2 },
  { width: 768, itemsToShow: 3 },
  { width: 1200, itemsToShow: 4 },
]

const CasinoTitle = (props: any) => {
  const { lastResult, gameId } = props

  console.log(lastResult,"in opent p")

  console.log(lastResult,"lastresult")
  const refAndarBahar2 = useRef(null)
  const refAndarBahar2B = useRef(null)
  const refAndarBahar = useRef(null)
  const refAndarBaharB = useRef(null)
  // const lastResult: any = useAppSelector(selectCasinoCurrentMatch)




  // console.log(lastResult,"cuurent match it is this")

  useEffect(() => {
    const andarData = pushDataToPositionsAndarBhar(lastResult?.Cards)
    if (andarData?.[1] && refAndarBahar2.current) {
      //@ts-expect-error
      refAndarBahar2.current.goTo(andarData?.[1].length)
    }

    if (andarData?.[0] && refAndarBahar2B.current) {
      //@ts-expect-error
      refAndarBahar2B.current.goTo(andarData?.[1].length)
    }
  }, [lastResult])

  useEffect(() => {
    const andarData = lastResult?.t3?.[0]?.aall?.split(',') || []
    const baharData = lastResult?.t3?.[0]?.ball?.split(',') || []

    if (andarData && refAndarBahar.current) {
      //@ts-expect-error
      refAndarBahar.current.goTo(andarData.length)
    }

    if (baharData && refAndarBaharB.current) {
      //@ts-expect-error
      refAndarBaharB.current.goTo(baharData.length)
    }
  }, [lastResult?.t3?.[0]?.aall])

  const pushDataToPositions = React.useCallback(
    (data: string) => {
      const positions = [0, 1, 2, 3]
      const dataArray: Array<string> = data ? data.split(',').filter((d) => d !== '1') : []
      return dataArray.reduce(
        (acc: Record<number, any>, item, index) => {
          const positionIndex = index % 4
          const position: any = positions[positionIndex]

          acc[position].push(item)
          return acc
        },
        {
          '0': [],
          '1': [],
          '2': [],
          '3': [],
        },
      )
    },
    [lastResult && lastResult.desc],
  )
  const pushDataToPositionsAndarBhar = React.useCallback(
    (data: string) => {
      const positions = [0, 1]
      const dataArray: Array<string> = data
        ? data.split(',').filter((d, i) => d !== '1' && i > 2)
        : []
      return dataArray.reduce(
        (acc: Record<number, any>, item, index) => {
          const positionIndex = index % 2
          const position: any = positions[positionIndex]

          acc[position].push(item)
          return acc
        },
        {
          '0': [],
          '1': [],
        },
      )
    },
    [lastResult && lastResult.desc],
  )
  const pushDataToPositionsCard32 = React.useCallback(
    (data: string) => {
      const positions = [0, 1, 2, 3]
      const dataArray: Array<string> = data ? data.split(',') : []
      return dataArray.reduce(
        (acc: Record<number, any>, item, index) => {
          const positionIndex = index % 4
          const position: any = positions[positionIndex]

          acc[position].push(item)
          return acc
        },
        {
          '0': [],
          '1': [],
          '2': [],
          '3': [],
        },
      )
    },
    [lastResult && lastResult.desc],
  )
  const pushDataToPositionsRace20 = React.useCallback(
    (data: string) => {
      const positions = [0, 1, 2, 3]
      const dataArray: Array<string> = data ? data.split(',').filter((d) => d !== '1') : []
      return dataArray.reduce(
        (acc: Record<number, any>, item, index) => {
          const positionIndex = index % 4
          ///const position: any = positions[positionIndex]
          let position = 0
          if (item.includes('CC')) position = 2
          if (item.includes('SS')) position = 3
          if (item.includes('DD')) position = 1
          if (item.includes('HH')) position = 0
          acc[position].push(item)
          return acc
        },
        {
          '0': [],
          '1': [],
          '2': [],
          '3': [],
        },
      )
    },
    [lastResult && lastResult.desc],
  )
  const queenVideoOverLay = () => {
    const cards = pushDataToPositions(lastResult.desc)
    return (
      <div className=''>
        <div className='videoCards' style={{ width: '100px' }}>
          <div>
            {[0, 1, 2, 3].map((card: any, index: number) => {
              return (
                <>
                  <div key={index}>
                    <p className={`${!isMobile ? 'mt-10 mb-10' : 'mbc-5'} text-white`}>
                      <b>
                        <span>
                          {lastResult.slug == 'queen'
                            ? `Total ${index}`
                            : `Player ${index + 8}`}
                        </span>
                        :{' '}
                        <span className='text-warning'>
                          {calculateTotalNumbersFromString(cards[index].join(',')) +
                            +(lastResult.slug == 'queen' ? index : index + 8)}
                        </span>
                      </b>
                    </p>
                    <div className='d-flex'>
                      {cards[index].map((card: any, index: number) => {
                        return (
                          <img
                            key={index}
                            src={`/imgs/casino/cards/${card}.png`}
                          />
                        )
                      })}
                    </div>
                  </div>
                </>
              )
            })}
          </div>
        </div>
      </div>
    )
  }

  const card32VideoOverLay = () => {
    const cards = pushDataToPositionsCard32(lastResult.desc)
    return (
      <div className='videoCards' style={{ width: '100px' }}>
        {[0, 1, 2, 3].map((card: any, index: number) => {
          return (
            <>
              <p className={`${!isMobile ? 'mt-10 mb-10' : 'mbc-5'} text-white`}>
                <b>
                  <span>
                    {lastResult.slug == 'queen' ? `Total ${index}` : `Player ${index + 8}`}
                  </span>
                  :{' '}
                  <span className='text-warning'>
                    {calculateTotalNumbersFromString(
                      cards[index].filter((ItemCard: any) => ItemCard != 1).join(','),
                    ) + +(lastResult.slug == 'queen' ? index : index + 8)}
                  </span>
                </b>
              </p>
              <div className='d-flex'>
                {cards[index].map((card: any, index: number) => {
                  if (card == 1) return
                  return (
                    <img
                      key={index}
                      src={`/imgs/casino/cards/${card}.png`}
                    />
                  )
                })}
              </div>
            </>
          )
        })}
      </div>
    )
  }

  const lucky7B = () => {
    const cardName = lastResult && lastResult.card != undefined ? lastResult.card : '1'
    // console.log(img,"img")

    return (
      <div className='video-overlay'>
        <div className='card-inner'>
          {/* <h3 className='text-white'>Card</h3>{' '} */}
          <img
            // src={`/imgs/casino/cards/${cardName}.png`}
            // src ={img}
            src={`/imgs/casino/cards/${cardName == "1" ?  "patti_back" : cardName}.png`}
          />
        </div>
      </div>
    )
  }

  const dt201day = () => {
    return (
      <div className='video-overlay'>
       <div className='imgspace d-flex'>
          <img
            src={`https://dzm0kbaskt4pv.cloudfront.net/v11/static/front/img/cards/${lastResult.C1 == "1" ? "patti_back" : lastResult.C1}.png`}
          />{' '}
          
          <img
            src={`https://dzm0kbaskt4pv.cloudfront.net/v11/static/front/img/cards/${lastResult?.C2 == "1" ? "patti_back" : lastResult?.C2}.png`}
          />
        </div>
      </div>
    )
  }

  const dt20 = () => {
    // card string ko array me split karo
    const cards = lastResult.card?.split(",") || [];
  
    return (
      <div className="video-overlay">
        <div className="imgspace d-flex">
          {cards.map((card:any, i:any) => (
            <img
              key={i}
              alt=""
              src={`/imgs/casino/cards/${card === "1" ? "patti_back" : card}.png`}
            />
          ))}
        </div>
      </div>
    );
  };

  const poker = () => {
    const cards = lastResult?.card?.split(",") || []; 
    console.log(cards,"cards in poker")
    return (
      <div className='video-overlay'>
        <div className='videoCards'>
          <div className='d-flex'>
            <div className='mr-20'>
              <p className='m-b-0 text-white'>
                <b>
                  <span className=''>Player A</span>
                </b>
              </p>
              <div className='imgspace'>
                <img
                  alt=''
                  src={`/imgs/casino/cards/${cards[0] == "1" ? "patti_back" : cards[0]}.png`}
                />
                <img
                  alt=''
                  src={`/imgs/casino/cards/${cards[1] == "1" ? "patti_back" : cards[1]}.png`}
                />
              </div>
            </div>
            <div className='mr-20'>
              <p className='m-b-0 text-white'>
                <b>
                  <span className=''>Player B</span>
                </b>
              </p>
              <div className='imgspace'>
                <img
                  alt=''
                  src={`/imgs/casino/cards/${cards[2] == "1" ? "patti_back" : cards[2]}.png`}
                />
                <img
                  alt=''
                  src={`/imgs/casino/cards/${cards[3] == "1" ? "patti_back" : cards[3]}.png`}
                />
              </div>
            </div>
          </div>
          <div>
            <p className='m-b-0 text-white'>
              <b>
                <span className=''>BOARD</span>
              </b>
            </p>
            <div className='imgspace'>
              <img
                alt=''
                src={`/imgs/casino/cards/${cards[4] == "1" ? "patti_back" : cards[4]}.png`}
              />
              <img
                alt=''
                src={`/imgs/casino/cards/${cards[5] == "1" ? "patti_back" : cards[5]}.png`}
              />
              <img
                alt=''
                src={`/imgs/casino/cards/${cards[6] == "1" ? "patti_back" : cards[6]}.png`}
              />
              <img
                alt=''
                src={`/imgs/casino/cards/${cards[7] == "1" ? "patti_back" : cards[7]}.png`}
              />
              <img
                alt=''
                src={`/imgs/casino/cards/${cards[8] == "1" ? "patti_back" : cards[8]}.png`}
              />
            </div>
          </div>
        </div>
      </div>
    )
  }

  const onepoker20 = () => {
    const cards = lastResult?.card?.split(",") || []; 
    console.log(cards,"cards in poker")
    return (
      <div className='video-overlay'>
        <div className='videoCards'>
          <div className='d-flex'>
            <div className='mr-20'>
              <p className='m-b-0 text-white'>
                <b>
                  <span className=''>Player A</span>
                </b>
              </p>
              <div className='imgspace'>
                <img
                  alt=''
                  src={`/imgs/casino/cards/${lastResult.C1 == "1" ? "patti_back" : lastResult.C1}.png`}
                />
                <img
                  alt=''
                  src={`/imgs/casino/cards/${lastResult.C2 == "1" ? "patti_back" : lastResult.C2}.png`}
                />
              </div>
            </div>
            <div className='mr-20'>
              <p className='m-b-0 text-white'>
                <b>
                  <span className=''>Player B</span>
                </b>
              </p>
              <div className='imgspace'>
                <img
                  alt=''
                  src={`/imgs/casino/cards/${lastResult.C3 == "1" ? "patti_back" : lastResult.C3}.png`}
                />
                <img
                  alt=''
                  src={`/imgs/casino/cards/${lastResult.C4 == "1" ? "patti_back" : lastResult.C4}.png`}
                />
              </div>
            </div>
          </div>
          <div>
            <p className='m-b-0 text-white'>
              <b>
                <span className=''>BOARD</span>
              </b>
            </p>
            <div className='imgspace'>
              <img
                alt=''
                src={`/imgs/casino/cards/${lastResult.C5 == "1" ? "patti_back" : lastResult.C5}.png`}
              />
              <img
                alt=''
                src={`/imgs/casino/cards/${lastResult.C6 == "1" ? "patti_back" : lastResult.C6}.png`}
              />
              <img
                alt=''
                src={`/imgs/casino/cards/${lastResult.C7 == "1" ? "patti_back" : lastResult.C7}.png`}
              />
              <img
                alt=''
                src={`/imgs/casino/cards/${lastResult.C8 == "1" ? "patti_back" : lastResult.C8}.png`}
              />
              <img
                alt=''
                src={`/imgs/casino/cards/${lastResult.C9 == "1" ? "patti_back" : lastResult.C9}.png`}
              />
            </div>
          </div>
        </div>
      </div>
    )
  }

  // const onedayteen = () => {
  //   return (
  //     <div className='video-overlay'>
  //       <div className='videoCards'>
  //         <div>
  //           <div className='mr-20'>
  //             <p className='m-b-0 text-white'>
  //               <b>
  //                 <span className=''>Player A</span>
  //               </b>
  //             </p>
  //             <div className='imgspace d-flex'>
  //               <img
  //                 alt=''
  //                 src={`/imgs/casino/cards/${lastResult.C1 ==  "1" ? "patti_back" : lastResult.C1}.png`}
  //               />

  //               <img
  //                 alt=''
  //                 src={`/imgs/casino/cards/${lastResult.C3==  "1" ? "patti_back" : lastResult.C3}.png`}
  //               />
  //               <img
  //                 alt=''
  //                 src={`/imgs/casino/cards/${lastResult.C5 ==  "1" ? "patti_back" : lastResult.C5}.png`}
  //               />
  //             </div>
  //           </div>
  //           <div className='mr-20'>
  //             <p className='m-b-0 text-white'>
  //               <b>
  //                 <span className=''>Player B</span>
  //               </b>
  //             </p>
  //             <div className='imgspace d-flex'>
  //               <img
  //                 alt=''
  //                 src={`/imgs/casino/cards/${lastResult.C2 ==  "1" ? "patti_back" : lastResult.C2}.png`}
  //               />
  //               <img
  //                 alt=''
  //                 src={`/imgs/casino/cards/${lastResult.C4 ==  "1" ? "patti_back" : lastResult.C4}.png`}
  //               />
  //               <img
  //                 alt=''
  //                 src={`/imgs/casino/cards/${lastResult.C6 ==  "1" ? "patti_back" : lastResult.C6}.png`}
  //               />
  //             </div>
  //           </div>
  //         </div>
  //       </div>
  //     </div>
  //   )
  // }

  const onedayteen = () => {
    // Card string ko array me split karte hain
    const cards = lastResult.card?.split(",") || [];
  
    return (
      <div className="video-overlay">
        <div className="videoCards">
          <div>
            {/* Player A */}
            <div className="mr-20">
              <p className="m-b-0 text-white">
                <b><span>Player A</span></b>
              </p>
              <div className="imgspace d-flex">
                {cards.filter((_:any, i:any) => i % 2 === 0).map((card:any, i:any) => (
                  <img
                    key={i}
                    alt=""
                    src={`/imgs/casino/cards/${card === "1" ? "patti_back" : card}.png`}
                  />
                ))}
              </div>
            </div>
  
            {/* Player B */}
            <div className="mr-20">
              <p className="m-b-0 text-white">
                <b><span>Player B</span></b>
              </p>
              <div className="imgspace d-flex">
                {cards.filter((_:any, i:any) => i % 2 !== 0).map((card:any, i:any) => (
                  <img
                    key={i}
                    alt=""
                    src={`/imgs/casino/cards/${card === "1" ? "patti_back" : card}.png`}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const dtl20 = () => {
    return (
      <div className='video-overlay'>
        <div className='card-inner'>
          {/* <h3 className='text-white'>DEALER</h3>{' '} */}
          <div className='d-flex'>
            <img
              src={`/imgs/casino/cards/${lastResult.C1 == "1" ? "patti_back" : lastResult.C1}.png`}
            />
            <img
              src={`/imgs/casino/cards/${lastResult.C2 == "1" ? "patti_back" : lastResult.C2}.png`}
            />
            <img
              src={`/imgs/casino/cards/${lastResult.C3 == "1" ? "patti_back" : lastResult.C3}.png`}
            />
          </div>
        </div>
      </div>
    )
  }

  const opentp = () => {
    const finalString = lastResult?.card?.split(',') || []
    console.log(finalString,"final String from opentp ")
    const cardData = finalString && finalString[0] && finalString[0]
    // .split(',')
    return (
      <div className='video-overlay'>
        <div className='card-inner'>
          {/* <h3 className='text-white'>DEALER</h3>{' '} */}
          <div className='d-flex'>
          <img
          src={`/imgs/casino/cards/${finalString[8] === "1" ? "patti_back" : finalString[8]}.png`}
         />
          <img
          src={`/imgs/casino/cards/${finalString[17] === "1" ? "patti_back" : finalString[17]}.png`}
         />
        <img
          src={`/imgs/casino/cards/${finalString[26] === "1" ? "patti_back" : finalString[26]}.png`}
        />
          </div>
        </div>
      </div>
    )
  }

  const Cards3J = () => {
    return (
      lastResult &&
      lastResult.C1 && (
        <div className='video-overlay'>
          <div className='imgspace d-flex'>
            <img
              src={`/imgs/casino/cards/${lastResult.C1 == "1" ? "patti_back" : lastResult.C1 }.png`}
            />{' '}
            <img
              src={`/imgs/casino/cards/${lastResult.C2 == "1" ? "patti_back" : lastResult.C2}.png`}
            />
            <img
              src={`/imgs/casino/cards/${lastResult.C3 == "1" ? "patti_back" : lastResult.C3}.png`}
            />
          </div>
        </div>
      )
    )
  }

  const Cricket2020 = () => {
    return (
      lastResult &&
      lastResult.C1 && (
        <div className='video-overlay'>
          <div className='card-inner'>
            {/* <h3 className='text-white'>DEALER</h3>{' '} */}
            <div className='imgspace d-flex'>
              <img
                src={`/imgs/casino/cards/${lastResult.C1}.png`}
              />{' '}
            </div>
          </div>
        </div>
      )
    )
  }

  const warcasino = () => {
    return (
      lastResult &&
      lastResult.C1 && (
        <div className='video-overlay'>
          <div className='card-inner'>
            {/* <h3 className='text-white'>DEALER</h3>{' '} */}
            <div className='imgspace d-flex'>
              <img
                src={`/imgs/casino/cards/${lastResult.C7 == "1" ? "patti_back" : lastResult.C7}.png`}
                />{' '}
            </div>
          </div>
        </div>
      )
    )
  }

  // const teen20 = () => {
  //   return (
  //     <div className='video-overlay'>
  //       <div className='videoCards'>
  //       <div className=''>
  //           <div className='mr-20'>
  //             <p className='m-b-0 text-white'>
  //               <b>
  //                 <span className=''>Player A</span>
  //               </b>
  //             </p>
  //             <div className='imgspace d-flex'>
  //               <img
  //                 alt=''
  //                 src={`/imgs/casino/cards/${lastResult.C1 == "1" ? "patti_back" : lastResult.C1}.png`}
  //               />
  //               <img
  //                 alt=''
  //                 src={`/imgs/casino/cards/${lastResult.C3  == "1" ? "patti_back" : lastResult.C3}.png`}
  //               />
  //               <img
  //                 alt=''
  //                 src={`/imgs/casino/cards/${lastResult.C5 == "1" ? "patti_back" : lastResult.C5}.png`}
  //               />
  //             </div>
  //           </div>
  //           <div className='mr-20'>
  //             <p className='m-b-0 text-white'>
  //               <b>
  //                 <span className=''>Player B</span>
  //               </b>
  //             </p>
  //             <div className='imgspace d-flex'>
  //               <img
  //                 alt=''
  //                 src={`/imgs/casino/cards/${lastResult.C2 == "1" ? "patti_back" : lastResult.C2}.png`}
  //               />
  //               <img
  //                 alt=''
  //                 src={`/imgs/casino/cards/${lastResult.C4 == "1" ? "patti_back" : lastResult.C4}.png`}
  //               />
  //               <img
  //                 alt=''
  //                 src={`/imgs/casino/cards/${lastResult.C6 == "1" ? "patti_back" : lastResult.C6}.png`}
  //               />
  //             </div>
  //           </div>
  //         </div>
  //       </div>
  //     </div>
  //   )
  // }

  const teen20 = () => {
    // Split string into array
    const cards = lastResult.card?.split(",") || [];
  
    return (
      <div className="video-overlay">
        <div className="videoCards">
          <div className="">
            {/* Player A */}
            <div className="mr-20">
              <p className="m-b-0 text-white">
                <b><span>Player A</span></b>
              </p>
              <div className="imgspace d-flex">
                {cards?.slice(0, 3).map((card:any, i:any) => (
                  <img
                    key={i}
                    alt=""
                    src={`/imgs/casino/cards/${card === "1" ? "patti_back" : card}.png`}
                  />
                ))}
              </div>
            </div>
  
            {/* Player B */}
            <div className="mr-20">
              <p className="m-b-0 text-white">
                <b><span>Player B</span></b>
              </p>
              <div className="imgspace d-flex">
                {cards.slice(3, 6).map((card:any, i:any) => (
                  <img
                    key={i}
                    alt=""
                    src={`/imgs/casino/cards/${card === "1" ? "patti_back" : card}.png`}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };
  

  const poker6player = () => {
    return (
      <div className='video-overlay'>
        <div className='videoCards'>
          <div className=''>
          <div className='mr-20'>
              <div className='imgspace d-flex'>
                <img
                  alt=''
                  src={`/imgs/casino/cards/${lastResult.C13 == "1" ? "patti_back" : lastResult.C13 }.png`}
                />
                <img
                  alt=''
                  src={`/imgs/casino/cards/${lastResult.C14 == "1" ? "patti_back" : lastResult.C14}.png`}
                />
                <img
                  alt=''
                  src={`/imgs/casino/cards/${lastResult.C15 == "1" ? "patti_back" : lastResult.C15}.png`}
                />
                <img
                  alt=''
                  src={`/imgs/casino/cards/${lastResult.C16 == "1" ? "patti_back" : lastResult.C16}.png`}
                />
                <img
                  alt=''
                  src={`/imgs/casino/cards/${lastResult.C17 == "1" ? "patti_back" : lastResult.C17}.png`}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  const race2020 = () => {
    const cards = pushDataToPositionsRace20(lastResult.desc)
    const cardExtra = lastResult?.desc?.split(',')?.filter((Item: string) => Item != '1') || []
    const carname = [
      'imgs/casino/spade.png',
      'imgs/casino/heart.png',
      'imgs/casino/club.png',
      'imgs/casino/diamond.png',
    ]
    return (
      <div>
        <div className='casino-video-title'>
          <span className='casino-name'>{lastResult.slug}</span>
          <div className='casino-video-rid'>
            Round ID:
            <span>{lastResult.match_id}</span>
            <div className='total-points'>
              <div>
                <div>Total Card:</div>
                <div>{cardExtra && cardExtra.length}</div>
              </div>
              <div>
                <div>Total Point:</div>
                <div>
                  {cardExtra && cardExtra.length > 0
                    ? calculateTotalNumbersFromString(cardExtra.join(','))
                    : 0}
                </div>
              </div>
            </div>
          </div>
        </div>{' '}
        <div className='video-overlay' style={{ top: isMobile ? '0px' : '120px' }}>
          <div className='videoCards'>
            <div className='video-overlay'>
              <div className='videoCards'>
                <div className=''>
                  <div className='mr-20'>
                    {[0, 1, 2, 3].map((card: any, index: number) => {
                      return (
                        <>
                          <div key={index}>
                            <div className='imgspace d-flex'>
                              <img alt='' src={carname[card]} />
                              {cards[index].map((card: any, index: number) => {
                                return (
                                  <img
                                    key={index}
                                    src={`/imgs/casino/cards/${card}.png`}
                                  />
                                )
                              })}
                            </div>
                          </div>
                        </>
                      )
                    })}
                  </div>
                </div>
              </div>
            </div>
          </div>{' '}
        </div>
      </div>
    )
  }

  const testtp = () => {
    return (
      <div className='video-overlay'>
        <div className='videoCards'>
        <div className=''>
            <div className='mr-20'>
              <p className='m-b-0 text-white'>
                <b>
                  <span className=''>Tiger</span>
                </b>
              </p>
              <div className='imgspace d-flex'>
                <img
                  alt=''
                  src={`/imgs/casino/cards/${lastResult.C1 == "1" ? "patti_back" : lastResult.C1}.png`}
                />
                <img
                  alt=''
                  src={`/imgs/casino/cards/${lastResult.C2 == "1" ? "patti_back" : lastResult.C2}.png`}
                />
                <img
                  alt=''
                  src={`/imgs/casino/cards/${lastResult.C3 == "1" ? "patti_back" : lastResult.C3}.png`}
                />
              </div>
            </div>
            <div className='mr-20'>
              <p className='m-b-0 text-white'>
                <b>
                  <span className=''>Lion</span>
                </b>
              </p>
              <div className='imgspace d-flex'>
                <img
                  alt=''
                  src={`/imgs/casino/cards/${lastResult.C4 == "1" ? "patti_back" : lastResult.C4}.png`}
                />
                <img
                  alt=''
                  src={`/imgs/casino/cards/${lastResult.C5 == "1" ? "patti_back" : lastResult.C5}.png`}
                />
                <img
                  alt=''
                  src={`/imgs/casino/cards/${lastResult.C6 == "1" ? "patti_back" : lastResult.C6}.png`}
                />
              </div>
            </div>
            <div className='mr-20'>
              <p className='m-b-0 text-white'>
                <b>
                  <span className=''>Dragon</span>
                </b>
              </p>
              <div className='imgspace d-flex'>
                <img
                  alt=''
                  src={`/imgs/casino/cards/${lastResult.C7 == "1" ? "patti_back" : lastResult.C7}.png`}
                />
                <img
                  alt=''
                  src={`/imgs/casino/cards/${lastResult.C8 == "1" ? "patti_back" : lastResult.C8}.png`}
                />
                <img
                  alt=''
                  src={`/imgs/casino/cards/${lastResult.C9 == "1" ? "patti_back" : lastResult.C9}.png`}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  const Superover = () => {
    const cardList = [
      lastResult.C1,
      lastResult.C2,
      lastResult.C3,
      lastResult.C4,
      lastResult.C5,
      lastResult.C6,
    ]
    return (
      lastResult &&
      lastResult.C1 && (
        <div className='video-overlay'>
          <div className='imgspace'>
            {cardList &&
              cardList.map((Item: any, key: number) => {
                return (
                  Item != '1' && (
                    <img
                      key={key}
                      src={`/imgs/card/${replacecardstringSuperover(Item)}b.png`}
                      className='mbc-5'
                    />
                  )
                )
              })}
          </div>
        </div>
      )
    )
  }

  // const fivecricket = () => {
  //   const cardList = [
  //     lastResult.C1,
  //     lastResult.C2,
  //     lastResult.C3,
  //     lastResult.C4,
  //     lastResult.C5,
  //     lastResult.C6,
  //   ]

  //   console.log(cardList,"card list in five cricket")
  //   return (
  //     lastResult &&
  //     lastResult.C1 && (
  //       <div className='video-overlay' style={{ background: 'none' }}>
  //         <div className='imgspace'>
  //           {cardList &&
  //             cardList?.map((Item: any, key: number) => {
  //               return (
  //                 <img
  //                   alt=''
  //                   className='mb-1'
  //                   key={key}
  //                   src={`/imgs/casino/cards/${Item}.png`}
  //                 />
  //               )
  //             })}
  //         </div>
  //       </div>
  //     )
  //   )
  // }

  const fivecricket = () => {
    const cardString = lastResult?.C1 || ""       // "ACC|ACC|2CC|1|1|1"
    const cardArray:any = cardString.split("|")       // ["ACC", "ACC", "2CC", "1", "1", "1"]
  
    return (
      lastResult &&
      lastResult.C1 && (
        <div className="video-overlay" style={{ background: "none" }}>
          <div className="imgspace">
            {cardArray?.map((card:any, index:any) => (
              <img
                key={index}
                alt={`card-${index}`}
                className="mb-1"
                src={`/imgs/casino/cards/${card === "1" ? "patti_back" : card}.png`}
              />
            ))}
          </div>
        </div>
      )
    )
  }
  

  const andarbahar = () => {
    const andarData = lastResult?.t3?.[0]?.aall?.split(',') || []
    const baharData = lastResult?.t3?.[0]?.ball?.split(',') || []
    if (lastResult?.t3?.[0]?.aall == '') return
    return (
      <div className='video-overlay'>
        <div className='videoCards'>
          <div>
            <div className='mr-20'>
              <p className='m-b-0 text-white'>
                <b>
                  <span className=''>Andar</span>
                </b>
              </p>
              <div className='imgspace d-flex'>
                {/* {andarData.length > 0 &&
                  andarData.length <= 4 &&
                  andarData.map((card: any, k: number) => {
                    return (
                      <img
                        key={k}
                        src={`https://dzm0kbaskt4pv.cloudfront.net/v12/static/front/img/cards/${card}.png`}
                      />
                    )
                  })} */}
                {andarData.length > 0 && (
                  // @ts-ignore
                  <Carousel ref={refAndarBahar} breakPoints={breakPoints} pagination={false}>
                    {andarData.map((Item: any, key: number) => {
                      return (
                        <img
                          alt=''
                          key={key}
                          src={`/imgs/casino/cards/${Item}.png`}
                        />
                      )
                    })}
                  </Carousel>
                )}
              </div>
            </div>
            <div className='mr-20'>
              <p className='m-b-0 text-white'>
                <b>
                  <span className=''>Bahar</span>
                </b>
              </p>
              <div className='imgspace d-flex'>
                {baharData.length > 0 && (
                  // @ts-ignore
                  <Carousel ref={refAndarBaharB} breakPoints={breakPoints} pagination={false}>
                    {baharData.map((Item: any, key: number) => {
                      return (
                        <img
                          alt=''
                          key={key}
                          src={`/imgs/casino/cards/${Item}.png`}
                        />
                      )
                    })}
                  </Carousel>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  const andarbahar2 = () => {
    const andarData = pushDataToPositionsAndarBhar(lastResult?.Cards)
    const cards = lastResult?.Cards?.split(',') || []
    if (!cards?.[0] || cards?.[0] == '1') return
    return (
      <div className='video-overlay' style={{ minWidth: '400px' }}>
        <div className='row row5 align-items-center'>
          <div className='col-1'>
            <div className='row row5'>
              <div className='col-12'>
                <p className='mb-0 text-white text-center' style={{ lineHeight: '44px' }}>
                  <b>A</b>
                </p>
              </div>
            </div>
            <div className='row row5'>
              <div className='col-12'>
                <p className='mb-0 text-white text-center' style={{ lineHeight: '44px' }}>
                  <b>B</b>
                </p>
              </div>
            </div>
          </div>
          <div className='col-1 pl-0'>
            <img
              src={`https://dzm0kbaskt4pv.cloudfront.net/v12/static/front/img/cards/${cards?.[0]}.png`}
              className='card-right'
            />
          </div>
          <div className='col-10'>
            <div className='card-inner'>
              <div className='row row5'>
                <div className='col-2'>
                  <img
                    src={`https://dzm0kbaskt4pv.cloudfront.net/v12/static/front/img/cards/${cards?.[2]}.png`}
                  />
                </div>
                <div className='col-10'>
                  {andarData?.[1]?.length > 4 && (
                    <>
                      {/* 
                      // @ts-ignore */}
                      <Carousel ref={refAndarBahar2} breakPoints={breakPoints} pagination={false}>
                        {andarData?.[1]?.map((card: any, k: number) => {
                          return (
                            <img
                              style={{ margin: '2px', display: 'flex' }}
                              key={k}
                              src={`https://dzm0kbaskt4pv.cloudfront.net/v12/static/front/img/cards/${card}.png`}
                            />
                          )
                        })}
                      </Carousel>
                    </>
                  )}
                  {andarData?.[1]?.length > 0 &&
                    andarData?.[1]?.length <= 4 &&
                    andarData?.[1]?.map((card: any, k: number) => {
                      return (
                        <img
                          key={k}
                          src={`https://dzm0kbaskt4pv.cloudfront.net/v12/static/front/img/cards/${card}.png`}
                        />
                      )
                    })}
                </div>
              </div>
            </div>
            <div className='card-inner'>
              <div className='row row5'>
                <div className='col-2'>
                  <img
                    src={`https://dzm0kbaskt4pv.cloudfront.net/v12/static/front/img/cards/${cards?.[1]}.png`}
                  />
                </div>
                <div className='col-10'>
                  {andarData?.[0]?.length > 4 && (
                    <>
                      {/* 
                      // @ts-ignore */}
                      <Carousel ref={refAndarBahar2B} breakPoints={breakPoints} pagination={false}>
                        {andarData?.[0]?.map((card: any, k: number) => {
                          return (
                            <img
                              style={{ margin: '2px', display: 'flex' }}
                              key={k}
                              src={`https://dzm0kbaskt4pv.cloudfront.net/v12/static/front/img/cards/${card}.png`}
                            />
                          )
                        })}
                      </Carousel>
                    </>
                  )}
                  {andarData?.[0]?.length > 0 &&
                    andarData?.[0]?.length <= 4 &&
                    andarData?.[0]?.map((card: any, k: number) => {
                      return (
                        <img
                          key={k}
                          src={`https://dzm0kbaskt4pv.cloudfront.net/v12/static/front/img/cards/${card}.png`}
                        />
                      )
                    })}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if(!lastResult && !lastResult){
    return <div>Loading...</div>
  }
  console.log(lastResult.slug,"sllug here ")
  return (
    <div>
      {lastResult && (lastResult.match_id || lastResult.id) && (
        <div className='video-overlaybox'>
          {lastResult.slug == 'queen' ||
          lastResult.slug == 'card32' ||
          lastResult.slug == 'card32b' ||
          lastResult.slug == 'card32eu' ? (
            <>
              <div className='casino-video-title'>
                <span className='casino-name'>{lastResult.slug}</span>
                <div className='casino-video-rid'>
                  Round ID:
                  <span>{lastResult.match_id}</span>
                </div>
              </div>
              {lastResult.slug == 'card32' || lastResult.slug == 'card32b'
                ? card32VideoOverLay()
                : queenVideoOverLay()}
            </>
          ) : (
            ''
          )}

          {lastResult.slug == 'race2020' ? race2020() : ''}
          {(lastResult.slug == 'lucky7eu' ||
            lastResult.slug == 'lucky7' ||
            lastResult.slug == 'AAA' ||
            lastResult.slug == 'ddb') &&
            lucky7B()}
          {(lastResult.slug == 'dt20' ||
            lastResult.slug == 'dt202' ||
            lastResult.slug == 'dragontiger1Day') &&
            dt20()}
            {(
            lastResult.slug == 'dragontiger1Day') &&
            dt201day()}
          {(lastResult.slug == 'poker') &&
            poker()}

{(lastResult.slug == 'onedaypoker20') &&
            onepoker20()}

          {lastResult.slug == 'teen' && lastResult?.match_id > 0 && onedayteen()}
          {((!isMobile && lastResult.slug == 'dtl20') || lastResult.slug == 'war') &&
            dtl20()}

          {lastResult.slug == 'teen8' && opentp()}
          {lastResult.slug == 'teen20' && teen20()}
          {lastResult.slug == 'poker6' && poker6player()}
          {lastResult.slug == 'testtp' && testtp()}
          {(lastResult.slug == 'Cards3J' ||
            lastResult.slug == 'worliinstant' ||
            lastResult.slug == 'worlimatka') &&
            Cards3J()}
          {lastResult.slug == 'Superover' && Superover()}
          {lastResult.slug == 'fivewicket' && fivecricket()}
          {lastResult.slug == 'cricket2020' && Cricket2020()}
          {lastResult.slug == 'warcasino' && warcasino()}
          {lastResult.slug == 'Andarbahar' && andarbahar()}
          {lastResult.slug == 'Andarbahar2' && andarbahar2()}

          {/* {gameId !== 'baccarat2' && gameId !== 'baccarat' ? (
          <div className='video-overlay'>
            <div className='videoCards'>{displaycards()}</div>
          </div>
        ) : (
          ''
        )} */}
        </div>
      )}
    </div>
  )
}
CasinoTitle.propTypes = {
  lastResult: PropTypes.shape({
    C1: PropTypes.string, // Define the expected type for lastResult.C1
    C2: PropTypes.string,
    C3: PropTypes.string,
    C4: PropTypes.string,
    C5: PropTypes.string,
    C6: PropTypes.string,
    // Add PropTypes for other properties of lastResult if needed
  }).isRequired,
}
export default CasinoTitle
