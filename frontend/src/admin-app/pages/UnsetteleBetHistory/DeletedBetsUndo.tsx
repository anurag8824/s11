

import React, { MouseEvent } from 'react'
import { toast } from 'react-toastify'
import moment from 'moment'
import mobileSubheader from '../_layout/elements/mobile-subheader'
import { isMobile } from 'react-device-detect'
import userService from '../../../services/user.service'
import { useAppSelector } from '../../../redux/hooks'
import User, { RoleType } from '../../../models/User'
import { selectUserData } from '../../../redux/actions/login/loginSlice'
import betService from '../../../services/bet.service'
import { AxiosResponse } from 'axios'
import IBet from '../../../models/IBet'
import { useNavigate } from 'react-router-dom'


const DeletedBetsUndo = ({ hideHeader, matchId }: any) => {
  

  const userState = useAppSelector<{ user: User }>(selectUserData)

 
  const [betHistory, setBetHistory] = React.useState([]);

  React.useEffect(() => {
    const fetchBetHistory = async () => {
      try {
        const res = await userService.getUsercompletedbets22();
        console.log(res, "res bet history");
        setBetHistory(res?.data?.data); // Or setBetHistory(res.data) depending on your API response
      } catch (e: any) {
        const error = e?.response?.data?.message || "Something went wrong";
        toast.error(error);
      }
    };

    fetchBetHistory();
  }, []); 


   const onUndo = (e: MouseEvent<HTMLAnchorElement>, bet: IBet) => {
        e.preventDefault();
    
        // Check if bet._id exists before proceeding
        if (!bet._id) {
          toast.error("Invalid bet data. Unable to delete.");
          return;
        }
    
        // Replace confirm with a custom modal for better UX (Optional)
        const userConfirmed = window.confirm('Are you sure you want to reverse?');
    
        if (userConfirmed) {
          betService.undodeleteCurrentBet(bet?._id).then((res: AxiosResponse) => {
            const { success, message } = res?.data?.data;
    
            if (success) {
              // Notify backend via socket
              // socketUser.emit('betDelete', { betId: bet._id, userId: bet.userId });
    
              // Show success toast notification
              toast.success(message);
              window.location.reload();
    
              // Update state safely
              // setMyAllBet((prevState: any) => ({
              //   ...prevState,
              //   docs: prevState?.docs?.filter(({ _id }: IBet) => _id !== bet._id),
              // }));
              // setRefreshStatus(betRefresh ? false : true);
  
            } else {
              toast.error('Failed to delete bet.');
            }
          }).catch((err) => {
            console.error('Error deleting bet:', err);
            toast.error('An error occurred while deleting the bet.');
          });
        }
      };

const navigate = useNavigate();

  return (
    <>

      {mobileSubheader?.subheaderdesktopadmin('Deleted Bets (Undo)')}
    
    <div style={{ padding: "0" }} className="container-fluid p-md-2 mt-3">
 
      
           <div className='containedr'>

      

      <div className="containe  mt-2">
      <div className="table-responsive">
        <table className="table table-bordered table-hover  table-striped" style={{ backgroundColor: "#f8ff9fa" }}>
          <thead className="thead-dark">
            <tr>
              <th>#</th>
              <th>Parent</th>
              <th>User Name</th>
              <th>Event Name</th>
              <th>Nation</th>
              <th>Game Name</th>
              <th>Bet On</th>
              <th>Rate</th>
              <th>Amount</th>
              <th>P/L</th>
              {/* <th>Place Date</th> */}
              <th>Undo</th>

            </tr>
          </thead>
          <tbody>
            {betHistory?.length === 0 ? (
              <tr>
                <td colSpan={10} className="text-center">No deleted bets found.</td>
              </tr>
            ) : (
              betHistory?.map((bet: any, index: number) => (
                <tr key={index}>
                    <td style={{background : bet.isBack ? "#72BBEF" : "#faa9ba" }} >{index + 1}</td>
                  <td style={{background : bet.isBack ? "#72BBEF" : "#faa9ba" }} >{bet.parentNameStr || '-'}</td>
                  <td style={{background : bet.isBack ? "#72BBEF" : "#faa9ba" }} >{bet.userName || '-'}</td>
                  <td style={{background : bet.isBack ? "#72BBEF" : "#faa9ba" }} >{bet.matchName || '-'}</td>
                  <td style={{background : bet.isBack ? "#72BBEF" : "#faa9ba" }} >{bet.selectionName || '-'}</td>
                  <td style={{background : bet.isBack ? "#72BBEF" : "#faa9ba" }} >{bet.gtype || '-'}</td>
                  <td style={{background : bet.isBack ? "#72BBEF" : "#faa9ba" }} >{bet.bet_on || '-'}</td>
                  <td style={{background : bet.isBack ? "#72BBEF" : "#faa9ba" }} >{bet.odds ?? '-'}</td>
                  <td style={{background : bet.isBack ? "#72BBEF" : "#faa9ba" }} >{bet.stack ?? '-'}</td>
                  <td style={{background : bet.isBack ? "#72BBEF" : "#faa9ba" }} >{bet.pnl ?? '-'}</td>
                  {/* <td style={{background : bet.isBack ? "#72BBEF" : "#faa9ba" }} >{new Date(bet.createdAt).toLocaleString()}</td> */}

                  <td style={{background : bet.isBack ? "#72BBEF" : "#faa9ba" }} className='no-wrap text-center'> {bet.status == 'deleted' && userState?.user?.role === RoleType.admin && (
                               <a onClick={(e) => onUndo && onUndo(e, bet)} href='#'>
                                 <i className='fa fa-undo' />
                                </a>
                  )}</td>

                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
      </div>
    </div>
    </>
  )
}
export default DeletedBetsUndo
