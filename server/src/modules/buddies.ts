import { Socket, Server } from "socket.io";
import { Database } from "sqlite3";

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
) => {
    //#region buddies functions

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
        console.log(answers_length);
        socket.nsp.to(roomCode).emit("allAnswersBuddies", answers_length);
    });

    socket.on("getQuestionsBuddies", async (roomCode: string) => {
        const questions = questionsArray.find((r) => r.room === roomCode)?.questions;

        socket.nsp.to(roomCode).emit("receiveQuestionsBuddies", questions);
    });

    socket.on("getAnswersBuddies", async (roomCode: string) => {
        const answers = answersArray.find((r) => r.room === roomCode)?.answers;
        console.log("get Answers");
        socket.nsp.to(roomCode).emit("receiveAnswersBuddies", answers);
    });

    socket.on("sendTheBestAnswerBuddies", async (roomCode: string, bestAnswer: number) => {
        console.log("send best answer");
        console.log(answersArray.find((r) => r.room === roomCode)?.answers[bestAnswer].answer);
    });
    //#endregion
};