import { Socket, Server } from "socket.io";
import { Database } from "sqlite3";
import { Room, User } from "../index";

type Question = {
    user: string;
    question: string;
}

type QuestionArray = {
    room: string;
    questions: Question[];
}

const questionsArray: QuestionArray[] = [];

type Answer = {
    user: string;
    answer: string;
}

type AnswersArray = {
    room: string;
    answers: Answer[];
}

const answersArray: AnswersArray[] = [];

module.exports = (
    io: Server,
    socket: Socket,
    db: Database,
    changeRoomRound: (roomCode: string, socket: Socket) => Promise<void>,
) => {
    //#region buddies functions
    const startNewRound = async (roomCode: string) => {
        await changeRoomRound(roomCode, socket);

        const questionIndex = Math.floor(Math.random() * (questionsArray.find((r) => r.room === roomCode)?.questions.length!-1));
        const question = questionsArray.find((r) => r.room === roomCode)?.questions[questionIndex].question;
        const user = questionsArray.find((r) => r.room === roomCode)?.questions[questionIndex].user;

        socket.nsp.to(roomCode).emit("receiveQuestionBuddies", question, user);
        
        questionsArray.find((r) => r.room === roomCode)?.questions.splice(questionIndex, 1);
        
        answersArray.find((r) => r.room === roomCode)?.answers.splice(0, answersArray.find((r) => r.room === roomCode)?.answers.length!);

        socket.nsp.to(roomCode).emit("newRoundBuddies");
    };

    const endGame = async (roomCode: string) => {
        socket.nsp.to(roomCode).emit("endGameBuddies");
    };
    //#endregion

    //#region buddies sockets
    socket.on("sendQuestionBuddies", async (roomCode: string, question: string) => {
        if(!questionsArray.find((r) => r.room === roomCode)){
            questionsArray.push({room: roomCode, questions: [{user: socket.id, question: question}]});
        }
        else{
            questionsArray.find((r) => r.room === roomCode)?.questions.push({user: socket.id, question: question});
        }

        const questions_length = questionsArray.find((r) => r.room === roomCode)?.questions.length;

        socket.nsp.to(roomCode).emit("allQuestionsBuddies", questions_length);
    });

    socket.on("sendAnswerBuddies", async (roomCode: string, answer: string) => {
        if(!answersArray.find((r) => r.room === roomCode)){
            answersArray.push({room: roomCode, answers: [{user: socket.id, answer: answer}]});
        }
        else{
            answersArray.find((r) => r.room === roomCode)?.answers.push({user: socket.id, answer: answer});
        }

        const answers_length = answersArray.find((r) => r.room === roomCode)?.answers.length;
        socket.nsp.to(roomCode).emit("allAnswersBuddies", answers_length);
    });

    socket.once("getQuestionsBuddies", async (roomCode: string) => {
        const questions = questionsArray.find((r) => r.room === roomCode)?.questions;

        startNewRound(roomCode);

        socket.nsp.to(roomCode).emit("receiveQuestionsBuddies", questions);
    });

    socket.on("getAnswersBuddies", async (roomCode: string) => {
        const answers = answersArray.find((r) => r.room === roomCode)?.answers;
        socket.nsp.to(roomCode).emit("receiveAnswersBuddies", answers);
    });

    socket.on("sendTheBestAnswerBuddies", async (roomCode: string, bestAnswer: number) => {
        if(questionsArray.find((r) => r.room === roomCode)?.questions.length === 0){
            endGame(roomCode);
            socket.nsp.to(roomCode).emit("receiveTheBestAnswerBuddies", answersArray.find((r) => r.room === roomCode)?.answers[bestAnswer].answer);
            return;
        }
        startNewRound(roomCode);
    });
    //#endregion
};