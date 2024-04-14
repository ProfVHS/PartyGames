import { Server, Socket } from "socket.io";
import { Database } from "sqlite3";
import { User } from "..";

//"MostBestAnswersInBuddies"
const medalsCategoriesNames: Medals[] = ["MostBombClicks", "LowestBalanceAfterCardGame", "BestRoundInColorsMemory"];

type Medals = "MostBombClicks" | "LowestBalanceAfterCardGame" | "BestRoundInColorsMemory";

type UserThatGotMedalType = {
  userID: string;
  username: string;
  points: number;
  award: Medals;
};

module.exports = (io: Server, socket: Socket, db: Database, updateUserScore: (id: string, score: number, socket: Socket) => void, getUsersData: (roomCode: string) => Promise<User[]>) => {
  const getMostBombClicks = async (roomCode: string) => {
    const usersmostclicks = await new Promise<User[]>((resolve, reject) => {
      db.all(
        `SELECT * FROM users user INNER JOIN (SELECT id_user, MAX(number) FROM clickTheBombClicks ) medal ON user.id = medal.id_user AND user.id_room = "${roomCode}"`,
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
    return usersmostclicks;
  };

  const getBestRoundInColorMemory = async (roomCode: string) => {
    const usersWithTheBestRound = await new Promise<User[]>((resolve, reject) => {
      db.all(
        `SELECT * FROM users user INNER JOIN (SELECT id_user, MAX(number) FROM colorsMemoryRoundRecord ) medal ON user.id = medal.id_user AND user.id_room = "${roomCode}"`,
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
        `SELECT * FROM users user INNER JOIN (SELECT id_user, MIN(number) FROM colorsMemoryRoundRecord ) medal ON user.id = medal.id_user AND user.id_room = "${roomCode}"`,
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
          if (user) {
            console.log(medal, user);
            const userThatGotMedal = handleUpdateUserScore(user, medal, usersThatGotMedal);
            usersThatGotMedal.push(userThatGotMedal);
          }
          return;
        }

        if (medal === "LowestBalanceAfterCardGame") {
          const userWithLowestBalance = await getLowestBalanceAfterCardGame(roomCode);
          const user = userWithLowestBalance[0];
          if (user) {
            console.log(medal, user);
            const userThatGotMedal = handleUpdateUserScore(user, medal, usersThatGotMedal);
            usersThatGotMedal.push(userThatGotMedal);
          }
          return;
        }

        if (medal === "BestRoundInColorsMemory") {
          const userWithLowestBalance = await getBestRoundInColorMemory(roomCode);
          const user = userWithLowestBalance[0];
          if (user) {
            console.log(medal, user);
            const userThatGotMedal = handleUpdateUserScore(user, medal, usersThatGotMedal);
            usersThatGotMedal.push(userThatGotMedal);
          }
          return;
        }
      })
    );

    return usersThatGotMedal;
  };

  const addExampleUser = async (socketId: string, roomCode: string) => {
    console.log(socketId);
    return await new Promise<void>((resolve, reject) => {
      db.run(
        `INSERT INTO users (id,username,score,alive,is_disconnect,id_room,id_selected,game_position,is_host) VALUES ("${socketId}", "ultra mango guy", 100, true, false, "${roomCode}", 0, 1, true)`,
        (err) => {
          if (err) {
            reject(err);
          }
        }
      );
    });
  };

  const addUserstoMostClicks = async (socketID: string) => {
    await new Promise<void>((resolve, reject) => {
      db.run(`INSERT INTO clickTheBombClicks (id_user,number) VALUES ("${socketID}", 5)`, (err) => {
        if (err) {
          reject(err);
        }
      });
      resolve();
    });
    await new Promise<void>((resolve, reject) => {
      db.run(`INSERT INTO colorsMemoryRoundRecord (id_user,number) VALUES ("${socketID}", 2)`, (err) => {
        if (err) {
          reject(err);
        }
      });
      resolve();
    });
    return await new Promise<void>((resolve, reject) => {
      db.run(`INSERT INTO lowestBalanceAfterCards (id_user,number) VALUES ("${socketID}", -10)`, (err) => {
        if (err) {
          reject(err);
        }
      });
      resolve();
    });
  };

  socket.on("exampleUserAdd", async (roomCode: string) => {
    await addExampleUser(socket.id, roomCode);
  });

  socket.on("getMedals", async (roomCode: string) => {
    await addUserstoMostClicks(socket.id); // temporary, to test the medal
    const medalsToCheck = randomizeMedalsCategories();
    const usersThatGotMedal = await handleMedals(roomCode, medalsToCheck);

    socket.emit("receiveMedals", usersThatGotMedal);
  });

  socket.on("getPodium", async (roomCode: string) => {
    const users = await getUsersData(roomCode);
    socket.emit("receivePodium", users);
  });
};
