const express = require("express");


const { open } = require("sqlite");
const sqlite3 = require("sqlite3");

const path = require("path");

const app = express();
const dbPath = path.join(__dirname, "cricketMatchDetails.db");

app.use(express.json());

let db = null;

const initializeDBAndServer = async () => {
  try {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    });
    app.listen(3000, () => {
      console.log("Server Running at http://localhost:3000/");
    });
  } catch (e) {
    console.log(`DB Error: ${e.message}`);
    process.exit(1);
  }
};
initializeDBAndServer();


const convertPlayerDbObjectToResponseObject = (dbObject) => {
  return {
		  playerId: dbObject.player_id,
		  playerName:dbObject.player_name,
		};
 };
 
 const convertMatchDetailsDbObjectToResponseObject = (dbObject) => {
    
	return {
			matchId: dbOject.match_id,
			match:dbObject.match,
			year:dbObject.year,
	};
 
 };
  

//get all players

app.get("/players/", async (request, response) => {
  const getPlayerDetails = ` 
    SELECT * 
    FROM
    player_details;
    `;

  const playersArray = await db.all(getPlayerDetails);
  response.send(
  playersArray.map( (eachPlayer) => 
	convertPlayerDbObjectToResponseObject(eachPlayer)
  )
  );
});

// get player by id
app.get("/players/:playerId/", async (request, response) => {
  const { playerId } = request.params;

  const playerDetailsQuery = `
     Select 
     * from
     player_details
     where player_id = ${playerId};
     `;

  const player = await db.get(playerDetailsQuery);
  response.send(convertPlayerDbObjectToResponseObject(player);
});

// update player details by id
app.put("/players/:playerId/", async (request, response) => {
  
  const { playerId } = request.params;

  const { playerName } = request.body;

  const playerDetailsQuery = `
     UPDATE
     player_details
     SET
     player_name='${playerName}'
     where 
     player_id =${playerId};
     `;

  await db.run(playerDetailsQuery);
  response.send("Player Details Updated");
});

// match details by id
app.get("/matches/:matchId/", async (request, response) => {
  const { matchId } = request.params;

  const matchDetailsQuery = `
     Select 
     * from
     match_details
     where match_id = ${matchId};
     `;

  const details = await db.get(matchDetailsQuery);
  response.send(convertMatchDetailsDbObjectToResponseObject(details));
});

// list of players by matches
app.get("/players/:playerId/matches/", async (request, response) => {
  const { playerId } = request.params;

  const playerMatchDetailsQuery = `
     Select 
     * from
     player_match_score 
	 natural join 
     match_details 
     where player_id= ${playerId};
     `;

  const details = await db.all(playerMatchDetailsQuery);
  response.send(
  details.map((eachMatch) => 
  convertMatchDetailsDbObjectToResponseObject(eachMatch)
  )
   );
});

// match details by player

app.get("/matches/:matchId/players/", async (request, response) => {
  const { matchId } = request.params;

  const playerMatchDetailsQuery = `
     Select 
     * from
     player_match_score 
	 natural join 
     player_details 
	 where match_id=${matchId};
     `;

  const details = await db.all(playerMatchDetailsQuery);
  response.send(
  details.map( (eachPlayer) => 
  convertPlayerDbObjectToResponseObject(eachPlayer)
  )
  );
});


// list of players by matches
app.get("/players/:playerId/playerScores/", async (request, response) => {
  const { playerId } = request.params;

  const playerMatchDetailsQuery = `
     Select 
     player_id as playerId,
	 player_name as playerName,
     sum(score) as totalScore,
     sum(fours) as totalFours,
     sum(sixes)  as totalSixes
      from
     player_match_score 
	 natural join 
     player_details
     where player_id= ${playerId};
     `;

  const details = await db.get(playerMatchDetailsQuery);
  response.send(details);
});

module.exports=app;

