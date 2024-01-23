import { Socket, Server } from "socket.io";
import { Database } from "sqlite3";

type Question = {
    question: string;
    user: string;
}

type QuestionArray = {
    room: string;
    questions: Question[];
}

const questionsArray: QuestionArray[] = [];

module.exports = (
    io: Server,
    socket: Socket,
    db: Database,
) => {
    //#region buddies functions

    //#endregion

    //#region buddies sockets
    socket.on("sendQuestionBuddies", async (roomCode: string, question: string) => {
        if(!questionsArray.find((r) => r.room === roomCode)){
            questionsArray.push({room: roomCode, questions: [{question: question, user: socket.id}]});
        }
        else{
            questionsArray.find((r) => r.room === roomCode)?.questions.push({question: question, user: socket.id});
        }

        const users_length = await new Promise<number>((resolve, reject) => {
            db.all(`SELECT * FROM users WHERE id_room = ${roomCode}`, [], (err, rows) => {
                if(err){
                    reject(err);
                } else {
                    resolve(rows.length);
                }
            });
        });

        const questions_length = questionsArray.find((r) => r.room === roomCode)?.questions.length;

        socket.nsp.to(roomCode).emit("allQuestionsBuddies", questions_length);
        
    });

    socket.on("sendAnswerBuddies", (roomCode, answer: string) => {
        console.log("sendAnswerBuddies");
    });
    //#endregion
};