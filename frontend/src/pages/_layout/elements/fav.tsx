import { AxiosResponse } from 'axios'
import React from 'react'
import sportsService from '../../../services/sports.service'
import IMatch from '../../../models/IMatch'

const Fav = (props: any) => {
    const [matchList, setMatchList] = React.useState([])
    React.useEffect(() => {
        sportsService.getMatchList('all', 'sports', '5').then((res: AxiosResponse<any>) => {
            setMatchList(res.data.data)
        })
    }, [])
    return (
        <div className='favourite'>
            <ul>
                {matchList.map((match: IMatch) => (
                    <li key={match.matchId}>
                        <a href={`odds/${match.matchId}`} className='new-launch-text'>
                            <span className='lable-fav'>
                                <i className='fa fa-ribbon'></i> {match.name}
                            </span>
                        </a>
                    </li>
                ))}
            </ul>
        </div>
    )
}
export default Fav
