import React, { ChangeEvent, MouseEvent, useRef } from 'react'
import User from '../../../models/User'
import { useAppDispatch, useAppSelector } from '../../../redux/hooks'
import { logout, selectUserData } from '../../../redux/actions/login/loginSlice'
import NavMenu from './nav-menu'
import {
  hideBalExp,
  HideBalExp,
  selectBalance,
  selectHideBalExp,
  setExposer,
  setSingleBal,
} from '../../../redux/actions/balance/balanceSlice'
import { CustomLink, useNavigateCustom } from './custom-link'
import { isMobile } from 'react-device-detect'
import Marqueemessge from '../../../admin-app/pages/_layout/elements/welcome'
import NavMobileMenu from './nav-mobile-menu'
import axios, { AxiosResponse } from 'axios'
import { CONSTANTS } from '../../../utils/constants'
import userService from '../../../services/user.service'
import ReactModal from 'react-modal'
import { useWebsocketUser } from '../../../context/webSocketUser'
import Rules from '../../Rules/rules'
import { selectRules } from '../../../redux/actions/common/commonSlice'
import AutocompleteComponent from '../../../components/AutocompleteComponent'
import matchService from '../../../services/match.service'
import IMatch from '../../../models/IMatch'
import casinoSlugs from '../../../utils/casino-slugs.json'
import UserService from "../../../services/user.service";
import WhatsAppIcon from '@mui/icons-material/WhatsApp';




const Header = () => {
// const isMobile = true

  const ref = useRef<any>(null)
  const userState = useAppSelector<{ user: User }>(selectUserData)
  const balance = useAppSelector(selectBalance)
  const selectHideBal = useAppSelector<HideBalExp>(selectHideBalExp)
  const rules = useAppSelector(selectRules)
  const dispatch = useAppDispatch()

  const navigate = useNavigateCustom()

  const { socketUser } = useWebsocketUser()

  const [showMenu, setShowMenu] = React.useState<boolean>(false)
  const [showAuto, setShowAuto] = React.useState<boolean>(false)

  const [userMessage, setUserMessage] = React.useState<string>('')

  const [hideExpBal, setHideExpBal] = React.useState<HideBalExp>({} as HideBalExp)

  const [isOpen, setIsOpen] = React.useState<any>(false)
  const [isOpenRule, setIsOpenRule] = React.useState<any>(false)
  const [getExposerEvent, setGetExposerEvent] = React.useState<any>([])

  // React.useEffect(() => {
  //   axios.get(`userMessage.json?v=${Date.now()}`).then((res: AxiosResponse) => {
  //     setUserMessage(res.data.message)
  //   })
  // }, [])

  React.useEffect(() => {
    setIsOpenRule(rules.open)
  }, [rules])

  React.useEffect(() => {
    const handlerExposer = ({ exposer, balance }: any) => {
      if (balance !== undefined) dispatch(setSingleBal(balance))
      if (exposer !== undefined) dispatch(setExposer(exposer))
    }
    socketUser.on('updateExposer', handlerExposer)

    return () => {
      socketUser.removeListener('updateExposer', handlerExposer)
    }
  }, [balance])

  React.useEffect(() => {
    setHideExpBal(selectHideBal)
  }, [selectHideBal])

  const logoutUser = (e: any) => {
    e.preventDefault()
    dispatch(logout())
    navigate.go('/login')
  }

  const onChangeBalExp = (e: ChangeEvent<HTMLInputElement>) => {
    const expBal = { ...hideExpBal, [e.target.name]: e.target.checked }
    dispatch(hideBalExp(expBal))
    localStorage.setItem(CONSTANTS.HIDE_BAL_EXP, JSON.stringify(expBal))
    setHideExpBal(expBal)
  }

  const getExposer = (e: MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault()
    setIsOpen(true)
    userService.getExposerEvent().then((res: AxiosResponse) => {
      setGetExposerEvent(res.data.data)
    })
  }

  React.useEffect(() => {
    /**
     * Alert if clicked on outside of element
     */
    const handleClickOutside = (event: any) => {
      if (showMenu && ref.current && !ref.current.contains(event.target)) {
        closeMenu()
      }
    }
    // Bind the event listener
    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      // Unbind the event listener on clean up
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [ref, showMenu])

  const closeMenu = () => {
    setShowMenu(false)
  }
  const suggestion = ({ value }: any) => {
    return matchService.getMatchListSuggestion({ name: value })
  }

  const onMatchClick = (match: IMatch | null) => {
    if (match) {
      window.location.href = `/odds/${match.matchId}`
    }
  }

  const [userParentAlldata, setUserParentAlldata] = React.useState<{ [key: string]: any }>(
    {}
  );

  // React.useEffect(() => {
  //     if (userState?.user?.username) {
  //       UserService.getUserDetail(userState?.user?.username).then(
  //         (res: AxiosResponse<any>) => {
  //           console.log(res, "ressss for all values");
  //           const detail = res?.data.data;
  //           setUserAlldata(detail);
  //         }
  //       );
  //     }
  //   }, [userState?.user?.username]);

    React.useEffect(() => {
      // const userState = useAppSelector<{ user: User }>(selectUserData);
      const username:any = userState?.user?.username;
  
      console.log(username, "testagentmaster");
      UserService.getParentUserDetail(username).then(
        (res: AxiosResponse<any>) => {
          console.log(res, "check balance for parent");
          const detail = res?.data.data[0];
          setUserParentAlldata(detail);
  
        }
      );
    }, [userState]);

  return (
    <header className='header'>
      <div className='container-fluid'>
        <div className='row'>
          <div className='header-top col-md-12'>
            <div className='flex05'>
              {isMobile ? (
                <CustomLink to='/match/4/in-play'>
                  <i className='fas fa-home' />
                </CustomLink>
              ) : (
                ''
              )}
              <CustomLink
                to='/match/4/in-play'
                className='logo router-link-exact-active router-link-active'
              >
                <img src='/imgs/logo.png' className='logo-icon' />
              </CustomLink>


            </div> 

            <ul className='flex05 justify-content-end d-flex profile-right-side'>
              <div className='row-deposit-button d-none mr-20'>
                <CustomLink className='btn btn-deposit mr-10' to={'/deposit'}> <img src="/depositimg.webp" className="w-2 mr-1" /> Deposit</CustomLink>
                <CustomLink className='btn btn-withdraw' to={'/withdraw'}>  <img src="/withdrawimg.webp" className="w-2 mr-1" /> Withdraw</CustomLink>
              </div>

<button
style={{position: "fixed",
  zIndex: "999",
  bottom: "50px",
  background:"none",
  border:"none",
  display:"none"
}}
  className="btns  btn-successx mr-2 d-n"
  onClick={() => {
    if (userParentAlldata?.parent?.phone) {
      const phoneNumber = userParentAlldata?.parent?.phone?.replace(/[^0-9]/g, ""); // sirf digits rakhega
      window.open(`https://wa.me/${phoneNumber}`, "_blank");
    }
  }}
>
  <img style={{width:"75px"}} src="/wp_support.webp" className="" />
</button>
              {!isMobile ? (
                <>
                  <li className='search float-left row'>
                    {/* <input
                      name='game_keyword'
                      placeholder='All Events'
                      autoComplete='off'
                      type='text'
                      className='search-input-show'
                    /> */}

                    <AutocompleteComponent<IMatch>
                      className={`search-input-show ${showAuto ? 'show' : ''}`}
                      label={'Search'}
                      optionKey={'name'}
                      api={suggestion}
                      onClick={onMatchClick}
                    />

                    <a
                      href='#'
                      onClick={(e: MouseEvent<HTMLAnchorElement>) => {
                        e.preventDefault()
                        setShowAuto(!showAuto)
                      }}
                      className={`search-input`}
                    >
                      <i className='fas fa-search-plus' />
                    </a>
                  </li>
                  <li className='float-left download-apklink'>
                    <div>
                      <a
                        href='#'
                        onClick={(e: MouseEvent<HTMLAnchorElement>) => {
                          e.preventDefault()
                          setIsOpenRule(true)
                        }}
                        className='rules-link m-r-5'
                      >
                        <b>Rules</b>
                      </a>
                    </div>
                  </li>
                </>
              ) : (
                <div>
                <AutocompleteComponent<IMatch>
                      className={`search-input-show ${showAuto ? 'show' : ''}`}
                      label={'Search'}
                      optionKey={'name'}
                      api={suggestion}
                      onClick={onMatchClick}
                    />

                    <a
                      href='#'
                      onClick={(e: MouseEvent<HTMLAnchorElement>) => {
                        e.preventDefault()
                        setShowAuto(!showAuto)
                      }}
                      className={`search-input`}
                    >
                      <i className='fas fa-search-plus' />
                    </a>
                   </div>
              )}
              <li className='ballance float-left'>
                {!isMobile && !selectHideBal.balance ? (
                  <div className='mby-5'>
                    {!isMobile ? (
                      <span>Balance: </span>
                    ) : (
                      <span>
                        <i
                          className={isMobile ? 'tx-14 fa fa-university' : 'fa fa-university'}
                          aria-hidden='true'
                        ></i>
                      </span>
                    )}
                    <b>
                      <span className={isMobile ? 'tx-14' : ''}>{balance.balance?.toFixed(2)}</span>
                    </b>
                  </div>
                ) : (
                  ''
                )}
                {!selectHideBal.exposer ? (
                  <div className='mty-5'>
                    <a href='#' onClick={getExposer}>
                      {!isMobile ? (
                        <span className=''>Exp: </span>
                      ) : (
                        <span className='tx-14 mrc-2'>Exp: </span>
                      )}

                      <b>
                        <span className={isMobile ? 'tx-14 ' : ''}>
                          {balance.exposer > 0 ? balance.exposer?.toFixed(2) : 0}
                        </span>
                      </b>
                    </a>
                  </div>
                ) : (
                  ''
                )}
              </li>
              <li className='account float-left'>
                {isMobile && !selectHideBal.balance ? (
                  <div>
                    <span>
                      <i className='tx-13 mrc-2 fa fa-university' aria-hidden='true'></i>
                    </span>
                    <span className='tx-13'>{balance.balance?.toFixed(2)}</span>
                  </div>
                ) : (
                  ''
                )}
                <span
                  className={isMobile ? 'profile-section tx-14' : ''}
                  onClick={() => setShowMenu(!showMenu)}
                >
                  {userState?.user?.username}
                  <i className='fas fa-chevron-down' />
                </span>
                {/*add class d-block -*/}
                <ul ref={ref} style={{ display: showMenu ? 'block' : 'none' }} className=''>
                  <li>
                    <CustomLink onClick={() => closeMenu()} to='/match/in-play' className=''>
                      Home
                    </CustomLink>
                  </li>
                  <li>
                    <CustomLink onClick={() => closeMenu()} to='/accountstatement' className=''>
                      Account Statement
                    </CustomLink>
                  </li>
                  {/* <li>
                    <CustomLink onClick={() => closeMenu()} to='/depositstatement' className=''>
                      Deposit Statement
                    </CustomLink>
                  </li>
                  <li>
                    <CustomLink onClick={() => closeMenu()} to='/withdrawstatement' className=''>
                      Withdraw Statement
                    </CustomLink>
                  </li> */}
                  <li>
                    <CustomLink onClick={() => closeMenu()} to='/profitloss' className=''>
                      Profit Loss Report
                    </CustomLink>
                  </li>
                  <li>
                    <CustomLink onClick={() => closeMenu()} to='/bethistory' className=''>
                      Bet History
                    </CustomLink>
                  </li>
                  <li>
                    <CustomLink onClick={() => closeMenu()} to='/unsettledbet' className=''>
                      Unsettled Bet
                    </CustomLink>
                  </li>
                  <li>
                    <CustomLink onClick={() => closeMenu()} to='/casino/result' className=''>
                      Casino Report History
                    </CustomLink>
                  </li>
                  <li>
                    <CustomLink onClick={() => closeMenu()} to='/button-values' className=''>
                      Set Button Values
                    </CustomLink>
                  </li>
                  <li>
                    <CustomLink onClick={() => closeMenu()} to='/settings/security-auth' className=''>
                      Security Auth Verification
                    </CustomLink>
                  </li>
                  <li>
                    <CustomLink onClick={() => closeMenu()} to='/changepassword' className=''>
                      Change Password
                    </CustomLink>
                  </li>
                  <li>
                    <label className='mb-0'>
                      <input
                        type={'checkbox'}
                        name={'balance'}
                        checked={hideExpBal.balance || false}
                        onChange={onChangeBalExp}
                        className='mrc-5'
                      />{' '}
                      Balance
                    </label>
                  </li>
                  <li>
                    <label className='mb-0'>
                      <input
                        type={'checkbox'}
                        name={'exposer'}
                        checked={hideExpBal.exposer || false}
                        onChange={onChangeBalExp}
                        className='mrc-5'
                      />{' '}
                      Exposer
                    </label>
                  </li>
                  <li>
                    <CustomLink onClick={() => closeMenu()} to='/rules' className=''>
                      Rules
                    </CustomLink>
                  </li>

                  <li className='border-top'>
                    <a
                      onClick={logoutUser}
                      href={'#'}
                      style={{ fontWeight: 'bold', color: 'red', textTransform: 'uppercase' }}
                    >
                      signout
                    </a>
                  </li>
                </ul>
              </li>
            </ul>
          </div>
          <Marqueemessge message={"jknsdfg"} />
          {!isMobile ? <NavMenu /> : <NavMobileMenu />}
        </div>
      </div>
      <div />
      <div className='modal-market' />
    
      <ReactModal
        isOpen={isOpen}
        onRequestClose={(e: any) => {
          setIsOpen(false)
        }}
        contentLabel='Set Max Bet Limit'
        className={'modal-dialog'}
        ariaHideApp={false}
      >
        <div className='modal-content'>
          <div className='modal-header'>
            My Market
            <button onClick={() => setIsOpen(false)} className='close float-right'>
              <i className='fas fa-times-circle'></i>
            </button>
          </div>
          <div className='modal-body'>
            <table className='reponsive table col-12'>
              <tr>
                <th>Event Name</th>
                <th>Total Bets</th>
              </tr>

              {getExposerEvent.map((exposer: any) => {
                let casinoSlug = ''
                if (exposer.sportId == 5000) {
                  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
                   // @ts-ignore
                  casinoSlug = casinoSlugs?.[exposer?.matchId]
                }
                return (
                  <tr key={exposer.matchName}>
                    <td>
                      <CustomLink
                        onClick={() => {
                          window.location.href =
                            exposer.sportId &&
                              Number.isInteger(+exposer.sportId) &&
                              exposer.sportId != 5000
                              ? `/odds/${exposer._id}`
                              : `/casino/${casinoSlug}/${exposer._id}`
                          setIsOpen(false)
                        }}
                        to={
                          exposer.sportId &&
                            Number.isInteger(+exposer.sportId) &&
                            exposer.sportId != 5000
                            ? `/odds/${exposer._id}`
                            : `/casino/${casinoSlug}/${exposer._id}`
                        }
                      >
                        {exposer.matchName}
                      </CustomLink>
                    </td>
                    <td>{exposer.myCount}</td>
                  </tr>
                )
              })}
            </table>
          </div>
        </div>
      </ReactModal>
      

      <ReactModal
        isOpen={isOpenRule}
        onRequestClose={(e: any) => {
          setIsOpenRule(false)
        }}
        contentLabel='Set Max Bet Limit'
        className={'modal-dialog w-90P'}
        ariaHideApp={false}
      >
        <div className='modal-content' style={{ height: '90vh', marginTop: "1%" }}>
          <div className='modal-header'>
            Rules
            <button onClick={() => setIsOpenRule(false)} className='close float-right'>
              <i className='fas fa-times-circle'></i>
            </button>
          </div>
          <div className='modal-body'>
            <Rules classData={'col-md-12'} />
          </div>
        </div>
      </ReactModal>
    </header>
  )
}
export default Header
