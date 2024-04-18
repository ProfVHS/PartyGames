import { Socket, Server } from "socket.io";
import { Database } from "sqlite3";
import { Room, User } from "../index";
import { get } from "http";

type Question = {
  user: string;
  question: string;
};

type Answer = {
  user: string;
  answer: string;
};

type GameArray = {
  room: string;
  status: "ANSWER" | "QUESTION" | "WAITINGANSWER" | "WAITINGQUESTION" | "SELECTANSWER" | "BESTANSWER";
  questions: Question[];
  answers: Answer[];
};

const buddiesArray: GameArray[] = [];

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
  //#region buddies medals
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
  //#endregion

  //#region buddies functions
  const startNewRound = async (roomCode: string) => {
    await changeRoomRound(roomCode, socket);

    console.log(buddiesArray.find((r) => r.room === roomCode)?.questions);

    const questionIndex = Math.floor(Math.random() * (buddiesArray.find((r) => r.room === roomCode)?.questions.length! - 1));
    console.log(questionIndex);
    const question = buddiesArray.find((r) => r.room === roomCode)?.questions[questionIndex].question;
    console.log(question);
    const user = buddiesArray.find((r) => r.room === roomCode)?.questions[questionIndex].user;
    console.log(user);

    socket.nsp.to(roomCode).emit("receiveQuestionBuddies", question, user);

    buddiesArray.find((r) => r.room === roomCode)?.questions.splice(questionIndex, 1);

    buddiesArray.find((r) => r.room === roomCode)?.answers.splice(0, buddiesArray.find((r) => r.room === roomCode)?.answers.length!);

    console.log(buddiesArray.find((r) => r.room === roomCode)?.answers);

    socket.nsp.to(roomCode).emit("newRoundBuddies");
  };

  const endGame = async (roomCode: string) => {
    await updateRoomRound(roomCode, 0, socket);
    usersResetData(roomCode, socket);
    socket.nsp.to(roomCode).emit("receiveNextGame");
  };
  //#endregion

  //#region buddies sockets
  socket.on("sendQuestionBuddies", async (roomCode: string, question: string) => {
    if (!buddiesArray.find((r) => r.room === roomCode)) {
      buddiesArray.push({
        room: roomCode,
        status: "QUESTION",
        questions: [{ user: socket.id, question: question }],
        answers: [],
      });
    } else {
      const usersLenght = await getUsersData(roomCode);
      const questions_length = buddiesArray.find((r) => r.room === roomCode)?.questions.length;

      if (usersLenght.length - 1 === questions_length) {
        socket.nsp.to(roomCode).emit("allQuestionsBuddies", "ANSWER");
      }

      buddiesArray.find((r) => r.room === roomCode)?.questions.push({ user: socket.id, question: question });
    }
  });

  socket.on("sendAnswerBuddies", async (roomCode: string, answer: string) => {
    const usersLenght = await getUsersData(roomCode);

    buddiesArray.find((r) => r.room === roomCode)?.answers.push({ user: socket.id, answer: answer });

    const answers_length = buddiesArray.find((r) => r.room === roomCode)?.answers.length;

    console.log(usersLenght.length - 1, answers_length);

    if (usersLenght.length - 1 === answers_length) {
      console.log("Powinno wykonać");
      socket.nsp.to(roomCode).emit("allAnswersBuddies", "SELECTANSWER");
    }
  });

  socket.on("getQuestionsBuddies", async (roomCode: string) => {
    startNewRound(roomCode);
  });

  socket.on("getAnswersBuddies", async (roomCode: string) => {
    const answers = buddiesArray.find((r) => r.room === roomCode)?.answers;
    socket.nsp.to(roomCode).emit("receiveAnswersBuddies", answers);
  });

  socket.on("sendTheBestAnswerBuddies", async (roomCode: string, bestAnswerIndex: number) => {
    const bestAnswer = buddiesArray.find((r) => r.room === roomCode)?.answers[bestAnswerIndex];
    bestAnswer && updateBestBuddiesAnswers(roomCode, bestAnswer.user, 1).then(() => getUsersBestBuddiesAnswers());

    const user = await new Promise<User>((resolve, reject) => {
      db.get(`SELECT * FROM users WHERE id = "${bestAnswer!.user}"`, (err, row: User) => {
        if (err) {
          reject(err);
        } else {
          resolve(row);
        }
      });
    });

    socket.nsp.to(roomCode).emit("receiveTheBestAnswerBuddies", { user: user.username, answer: bestAnswer!.answer }, "BESTANSWER");

    if (buddiesArray.find((r) => r.room === roomCode)?.questions.length === 0) socket.nsp.to(roomCode).emit("receiveGameOver");

    updateUserScore(bestAnswer!.user, 70, socket);
  });

  socket.on("endGameBuddies", async (roomCode: string) => {
    endGame(roomCode);
  });
  //#endregion
};
