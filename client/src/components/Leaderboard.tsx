import React from 'react'

import "../styles/Leaderboard.scss";

interface LeaderboardProps{
    users: {username: string, score: number}[]
}
export default function Leaderboard({users}:LeaderboardProps) {
  return (
    <div className='leaderboard'>
        <span className='leaderboard__title'>Leaderboard</span>
        {users.map((user, i) => {
            return <LeaderboardItem key={i} pos={i+1} user={user} />
        })}
    </div>
  )
}

interface LeaderboardItemProps{
    user: {username: string, score: number}
    pos: number
}
function LeaderboardItem({user, pos}: LeaderboardItemProps){
    return(
        <div className='leaderboard__item'>
            <span>{pos}.{user.username}</span>
            <span>{user.score}</span>
        </div>
    )
}