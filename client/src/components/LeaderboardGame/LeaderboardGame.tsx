import { useEffect } from "react";
import "./style.scss";

interface LeaderboardGameProps {
    users?: { username: string; scoreToAdd: number | null; record: number }[];
};

export default function LeaderboardGame({ users }: LeaderboardGameProps) {

    useEffect(() => {
        users?.sort((a, b) => {return b.record - a.record} );
    }, [users]);

    return (
        <>
            <div className="leaderboardGame">
                <div className="leaderboardGame__title">Leaderboard</div>
                <div className="leaderboard__grid">
                    {users?.map((user, index) => (
                        <LeaderboardItem key={index} username={user.username} scoreToAdd={user.scoreToAdd} record={user.record}/>
                    ))}
                </div>
                
            </div>
        </>
    )
}

interface LeaderboardItemProps {
    username: string;
    scoreToAdd: number | null;
    record: number;
};

function LeaderboardItem({ username, scoreToAdd, record }: LeaderboardItemProps) {
  
    return (
        <div className={`leaderboard__item`}>
            <span>{username}</span>
            <span>{scoreToAdd ? `+${scoreToAdd}`: ""}</span>
            <span>{record}</span>
        </div>
    );
}