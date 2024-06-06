import { Server, Socket } from "socket.io";
import { Database } from "sqlite3";
import { User } from "..";

//"MostBestAnswersInBuddies"

type Medals = "MostBombClicks" | "LowestBalanceAfterCardGame" | "BestRoundInColorsMemory" | "MostFiguredOutDiamonds" | "MostBestAnswersInBuddies";
const medalsCategoriesNames: Medals[] = ["MostBombClicks", "LowestBalanceAfterCardGame", "BestRoundInColorsMemory", "MostFiguredOutDiamonds", "MostBestAnswersInBuddies"];

type UserThatGotMedalType = {
  userID: string;
  username: string;
  points: number;
  award: Medals;
};
module.exports = (io: Server, socket: Socket, db: Database, updateUserScore: (id: string, score: number, socket: Socket) => void, getUsersData: (roomCode: string) => Promise<User[]>) => {
  const getMostBombClicks = async (roomCode: string) => {
    const usersmostclicks = await new Promise<User[]>((resolve, reject) => {
      db.all(`SELECT user.*, MAX(medal.number) FROM clickTheBombClicks medal INNER JOIN users user ON medal.id_user = user.id WHERE user.id_room = "${roomCode}"`, [], (err: Error, users: User[]) => {
        if (err) {
          reject(err);
        } else {
          resolve(users);
        }
      });
    });

    return usersmostclicks;
  };

  const getBestRoundInColorMemory = async (roomCode: string) => {
    const usersWithTheBestRound = await new Promise<User[]>((resolve, reject) => {
      db.all(
        `SELECT user.*, MAX(medal.number) FROM colorsMemoryRoundRecord medal INNER JOIN users user ON medal.id_user = user.id WHERE user.id_room = "${roomCode}"`,
        [],
        (err: Error, users: User[]) => {
          if (err) {
            reject(err);
          } else {
            resolve(users);
          }
        }
      );
    });
    return usersWithTheBestRound;
  };

  const getLowestBalanceAfterCardGame = async (roomCode: string) => {
    const usersWithLowestBalanceAfterCardGame = await new Promise<User[]>((resolve, reject) => {
      db.all(
        `SELECT user.*, MIN(medal.number) FROM lowestBalanceAfterCards medal INNER JOIN users user ON medal.id_user = user.id WHERE user.id_room = "${roomCode}"`,
        [],
        (err: Error, users: User[]) => {
          if (err) {
            reject(err);
          } else {
            resolve(users);
          }
        }
      );
    });
    return usersWithLowestBalanceAfterCardGame;
  };

  const getMostFiguredOutDiamonds = async (roomCode: string) => {
    const userWithMostFiguredOutDiamonds = await new Promise<User[]>((resolve, reject) => {
      db.all(`SELECT user.*, MAX(medal.number) FROM figuredOutDiamonds medal INNER JOIN users user ON medal.id_user = user.id WHERE user.id_room = "${roomCode}"`, [], (err: Error, users: User[]) => {
        if (err) {
          reject(err);
        } else {
          resolve(users);
        }
      });
    });
    return userWithMostFiguredOutDiamonds;
  };

  const getMostBestAnswersInBuddies = async (roomCode: string) => {
    const userWithMostBestAnswers = await new Promise<User[]>((resolve, reject) => {
      db.all(`SELECT user.*, MAX(medal.number) FROM bestBuddiesAnswers medal INNER JOIN users user ON medal.id_user = user.id WHERE user.id_room = "${roomCode}"`, [], (err: Error, users: User[]) => {
        if (err) {
          reject(err);
        } else {
          resolve(users);
        }
      });
    });
    return userWithMostBestAnswers;
  };

  const randomizeMedalsCategories = () => {
    const medalsCategoriesSet = new Set<Medals>();

    while (medalsCategoriesSet.size < 3) {
      const randomIndex = Math.floor(Math.random() * medalsCategoriesNames.length);
      medalsCategoriesSet.add(medalsCategoriesNames[randomIndex]);
    }

    const medalsCategories = Array.from(medalsCategoriesSet);

    return medalsCategories;
  };

  const randomizeScore = () => {
    return Math.floor(Math.random() * 4 + 1) * 50;
  };

  const handleUpdateUserScore = (user: User, medal: Medals, usersThatGotMedal: UserThatGotMedalType[]) => {
    const scoreForThatMedal = randomizeScore();
    updateUserScore(user.id, scoreForThatMedal, socket);
    const userThatGotMedal = { userID: user.id, username: user.username, points: scoreForThatMedal, award: medal };
    return userThatGotMedal;
  };

  const handleMedals = async (roomCode: string, medalsCategories: Medals[]) => {
    let usersThatGotMedal: UserThatGotMedalType[] = [];

    await Promise.all(
      medalsCategories.map(async (medal: Medals) => {
        if (medal === "MostBombClicks") {
          const usersMostClicks = await getMostBombClicks(roomCode);
          const user = usersMostClicks[0];
          if (user.id !== null) {
            const userThatGotMedal = handleUpdateUserScore(user, medal, usersThatGotMedal);
            usersThatGotMedal.push(userThatGotMedal);
          }
          return;
        }

        if (medal === "LowestBalanceAfterCardGame") {
          const userWithLowestBalance = await getLowestBalanceAfterCardGame(roomCode);
          const user = userWithLowestBalance[0];
          if (user.id !== null) {
            const userThatGotMedal = handleUpdateUserScore(user, medal, usersThatGotMedal);
            usersThatGotMedal.push(userThatGotMedal);
          }
          return;
        }

        if (medal === "BestRoundInColorsMemory") {
          const userWithLowestBalance = await getBestRoundInColorMemory(roomCode);
          const user = userWithLowestBalance[0];
          if (user.id !== null) {
            const userThatGotMedal = handleUpdateUserScore(user, medal, usersThatGotMedal);
            usersThatGotMedal.push(userThatGotMedal);
          }
          return;
        }
        if (medal === "MostFiguredOutDiamonds") {
          const userWithMostFiguredOutDiamonds = await getMostFiguredOutDiamonds(roomCode);
          const user = userWithMostFiguredOutDiamonds[0];
          if (user.id !== null) {
            const userThatGotMedal = handleUpdateUserScore(user, medal, usersThatGotMedal);
            usersThatGotMedal.push(userThatGotMedal);
          }
          return;
        }

        if (medal === "MostBestAnswersInBuddies") {
          const userWithMostBestAnswers = await getMostBestAnswersInBuddies(roomCode);
          const user = userWithMostBestAnswers[0];
          if (user.id !== null) {
            const userThatGotMedal = handleUpdateUserScore(user, medal, usersThatGotMedal);
            usersThatGotMedal.push(userThatGotMedal);
          }
          return;
        }
      })
    );

    return usersThatGotMedal;
  };

  socket.on("getMedals", async (roomCode: string) => {
    const medalsToCheck = randomizeMedalsCategories();
    const usersThatGotMedal = await handleMedals(roomCode, medalsToCheck);

    socket.nsp.to(roomCode).emit("receiveMedals", usersThatGotMedal);
  });

  socket.on("getPodium", async (roomCode: string) => {
    const users = await getUsersData(roomCode);
    const usersSorted = users.sort((a, b) => b.score - a.score);
    socket.nsp.to(roomCode).emit("receivePodium", usersSorted);
  });
};
