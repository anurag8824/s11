import { useParams } from "react-router-dom";
import ICasinoMatch from "../../../models/ICasinoMatch";
import ISport from "../../../models/ISport";
import { selectCasinoMatchList } from "../../../redux/actions/casino/casinoSlice";
import { selectSportList } from "../../../redux/actions/sports/sportSlice";
import { useAppSelector } from "../../../redux/hooks";
import { CustomLink, useNavigateCustom } from "./custom-link";
import { MouseEvent } from "react";
import { toast } from "react-toastify";

const SideBar = () => {
  const navigate = useNavigateCustom();
  const sportListState = useAppSelector<{ sports: ISport[] }>(selectSportList);
  const { sportId, matchId } = useParams();
  const gamesList = useAppSelector<any>(selectCasinoMatchList);

  const onCasinoClick = (
    e: MouseEvent<HTMLAnchorElement>,
    Item: ICasinoMatch
  ) => {
    e.preventDefault();
    if (!Item.isDisable && Item.match_id != -1)
      navigate.go(`/casino/${Item.slug}/${Item.match_id}`);
    else toast.warn("This game is suspended by admin, please try again later");
  };

  return (
    <div className="sidebar col-md-2">
      

      <div
        data-toggle="collapse"
        data-target=".racing"
        className="sidebar-title"
      >
        <h5 className="d-inline-block m-b-0">Racing</h5>
      </div>
      <nav className="collapse racing show">
        <ul>
          {sportListState.sports.map((sport: ISport) => {
            if (sport.sportId != 7 && sport.sportId != 4339) return;
            return (
              <li key={sport._id} className="nav-item">
                <CustomLink
                  to={`/match/${sport.sportId}`}
                  className={`nav-link ${
                    parseInt(sportId || "0") == sport.sportId
                      ? "router-link-active"
                      : ""
                  }`}
                >
                  <span className="new-launch-text">{sport.name}</span>
                </CustomLink>
              </li>
            );
          })}
        </ul>
      </nav>

      <div
        data-toggle="collapse"
        data-target=".casino"
        className="sidebar-title"
      >
        <h5 className="d-inline-block m-b-0">Others</h5>
      </div>
      <nav className="collapse casino show">
        <ul>
          <li className="nav-item">
            <CustomLink to={`/casino-in/live-dmd`} className={`nav-link`}>
              <span className="new-launch-text blink_me">Our Casino</span>
            </CustomLink>
          </li>
          {/* <li className='nav-item'>
            <CustomLink
              to={`/casino-int/virtual-casino`}
              className={`nav-link`}
            >
              <span className='new-launch-text blink_me'>Our Virtual</span>
            </CustomLink>
          </li> */}
          <li className="nav-item">
            <CustomLink to={`/casino-in/live-dmd`} className={`nav-link`}>
              <span className="new-launch-text ">Live Casino</span>
            </CustomLink>
          </li>
          {/* <li className='nav-item'>
            <CustomLink
              to={`/casino-int/slots`}
              className={`nav-link`}
            >
              <span className='new-launch-text'>Slot Game</span>
            </CustomLink>
          </li> */}
          {/* <li className='nav-item'>
            <CustomLink
              to={`/casino-int/fantasy`}
              className={`nav-link`}
            >
              <span className='new-launch-text'>Fantasy Game</span>
            </CustomLink>
          </li> */}
        </ul>
      </nav>
      <div
        data-toggle="collapse"
        data-target=".sports"
        className="sidebar-title"
      >
        <h5 className="d-inline-block m-b-0">Sports</h5>
      </div>
      <nav className="collapse sports show">
        <ul>
          {sportListState.sports
            ?.filter((sport: any) => [4, 1, 2].includes(sport?.sportId))
            ?.map((sport: ISport) => (
              <li key={sport._id} className="nav-item">
                <CustomLink
                  to={`/match/${sport.sportId}`}
                  className={`nav-link ${
                    sportId == sport.sportId ? "router-link-active" : ""
                  }`}
                >
                  <i className="far fa-plus-square me-1"></i>
                  <span className="new-launch-text">{sport.name}</span>
                </CustomLink>
              </li>
            ))}
        </ul>
      </nav>
    </div>
  );
};
export default SideBar;
