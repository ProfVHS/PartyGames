import { Socket, Server } from "socket.io";
import { Database } from "sqlite3";
import { Room, User } from "../index";
import { get } from "http";

type Question = {
  user: string;
  question: string;
};

type QuestionArray = {
  room: string;
  questions: Question[];
};

const questionsArray: QuestionArray[] = [];

type Answer = {
  user: string;
  answer: string;
};

type AnswersArray = {
  room: string;
  answers: Answer[];
};

const answersArray: AnswersArray[] = [];

module.exports = (
  io: Server,
  socket: Socket,
  db: Database,
  changeRoomRound: (roomCode: string, socket: Socket) => Promise<void>,
  updateRoomRound: (roomCode: string, round: number, socket: Socket) => Promise<void>,
  usersResetData: (roomCode: string, socket: Socket) => void,
  updateUserScore: (id: string, score: number, socket: Socket) => Promise<void>,
  getUsersData: (roomCode: string) => Promise<User[]>
) => {
  const addUsersToBestBuddiesAnswersDb = async (roomCode: string) => {
    const usersArray = await getUsersData(roomCode);
    return await new Promise<void>((resolve, reject) => {
      usersArray.forEach((user) => {
        db.run(`INSERT INTO bestBuddiesAnswers (id_user,number) VALUES ("${user.id}",0)`, (err) => {
          if (err) {
            reject(err);
          }
        });
      });
      resolve();
    });
  };

  const updateBestBuddiesAnswers = async (roomCode: string, user_id: string, number: number) => {
    return new Promise<void>((resolve, reject) => {
      db.run(`UPDATE bestBuddiesAnswers SET number = ${number} WHERE id_user = "${user_id}" AND number < ${number}`, (err) => {
        if (err) {
          reject(err);
        } else {
          resolve();
        }
      });
    });
  };

  const getUsersBestBuddiesAnswers = async () => {
    const userMostClicks = await new Promise<User[]>((resolve, reject) => {
      db.all(`SELECT * FROM bestBuddiesAnswers ORDER BY number DESC`, [], (err: Error, rows: User[]) => {
        if (err) {
          reject(err);
        } else {
          resolve(rows);
        }
      });
    });

    console.log(userMostClicks);
  };

  socket.on("initBestBuddiesAnswers", async (roomCode: string) => {
    console.log("test");
    await addUsersToBestBuddiesAnswersDb(roomCode);
  });

  //#region buddies functions
  const startNewRound = async (roomCode: string) => {
    await changeRoomRound(roomCode, socket);

    const questionIndex = Math.floor(Math.random() * (questionsArray.find((r) => r.room === roomCode)?.questions.length! - 1));
    const question = questionsArray.find((r) => r.room === roomCode)?.questions[questionIndex].question;
    const user = questionsArray.find((r) => r.room === roomCode)?.questions[questionIndex].user;

    socket.nsp.to(roomCode).emit("receiveQuestionBuddies", question, user);

    questionsArray.find((r) => r.room === roomCode)?.questions.splice(questionIndex, 1);

    answersArray.find((r) => r.room === roomCode)?.answers.splice(0, answersArray.find((r) => r.room === roomCode)?.answers.length!);

    socket.nsp.to(roomCode).emit("newRoundBuddies");
  };

  const endGame = async (roomCode: string) => {
    socket.nsp.to(roomCode).emit("endGameBuddies");
    await updateRoomRound(roomCode, 0, socket);
    usersResetData(roomCode, socket);
    socket.nsp.to(roomCode).emit("receiveNextGame");
  };
  //#endregion

  //#region buddies sockets
  socket.on("sendQuestionBuddies", async (roomCode: string, question: string) => {
    if (!questionsArray.find((r) => r.room === roomCode)) {
      questionsArray.push({ room: roomCode, questions: [{ user: socket.id, question: question }] });
    } else {
      questionsArray.find((r) => r.room === roomCode)?.questions.push({ user: socket.id, question: question });
    }

    const questions_length = questionsArray.find((r) => r.room === roomCode)?.questions.length;

    socket.nsp.to(roomCode).emit("allQuestionsBuddies", questions_length);
  });

  socket.on("sendAnswerBuddies", async (roomCode: string, answer: string) => {
    if (!answersArray.find((r) => r.room === roomCode)) {
      answersArray.push({ room: roomCode, answers: [{ user: socket.id, answer: answer }] });
    } else {
      answersArray.find((r) => r.room === roomCode)?.answers.push({ user: socket.id, answer: answer });
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

  socket.on("sendTheBestAnswerBuddies", async (roomCode: string, bestAnswerIndex: number) => {
    const bestAnswer = answersArray.find((r) => r.room === roomCode)?.answers[bestAnswerIndex];    
    bestAnswer && updateBestBuddiesAnswers(roomCode, bestAnswer.user, 1).then(() => getUsersBestBuddiesAnswers());

    const user = await new Promise<User>((resolve, reject) => {
      db.get(`SELECT * FROM users WHERE id = "${bestAnswer.user}"`, (err, row: User) => {
        if (err) {
          reject(err);
        } else {
          resolve(row);
        }
      });
    });

    socket.nsp.to(roomCode).emit("receiveTheBestAnswerBuddies", { user: user.username, answer: bestAnswer.answer });

    updateUserScore(userId!, 70, socket);

    setTimeout(() => {
      if(questionsArray.find((r) => r.room === roomCode)?.questions.length === 0){
        endGame(roomCode);
      } else {
        startNewRound(roomCode);
      }
    }, 5000);
  });
  //#endregion
};
