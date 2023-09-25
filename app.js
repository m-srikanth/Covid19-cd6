const express = require("express");
const path = require("path");
const { open } = require("sqlite");
const sqlite3 = require("sqlite3");
const app = express();
app.use(express.json());
let db = null;
const dbPath = path.join(__dirname, "covid19India.db");

const initiatingDB = async () => {
  try {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    });
    app.listen(3000, () => {
      console.log("It's Running...");
    });
  } catch (e) {
    console.log(`Error is ${e.message}`);
    process.exit(1);
  }
};
initiatingDB();

//API-1
app.get("/states/", async (request, response) => {
  const query = `SELECT * FROM state;`;
  const outPut = await db.all(query);
  const result = (i) => {
    return {
      stateId: i.state_id,
      stateName: i.state_name,
      population: i.population,
    };
  };
  response.send(outPut.map((i) => result(i)));
});

//API-2
app.get("/states/:stateId/", async (request, response) => {
  const { stateId } = request.params;
  const query = `SELECT * FROM state WHERE state_id = ${stateId};`;
  const outPut = await db.get(query);
  const result = {
    stateId: outPut.state_id,
    stateName: outPut.state_name,
    population: outPut.population,
  };
  response.send(result);
});
//API-3
app.post("/districts/", async (request, response) => {
  const { districtName, stateId, cases, cured, active, deaths } = request.body;
  const query = `INSERT INTO district(district_name, state_id, cases, cured, active, deaths)
    VALUES ('${districtName}', '${stateId}', '${cases}', '${cured}', '${active}', '${deaths}');`;
  const outPut = await db.run(query);
  response.send("District Successfully Added");
});
//API-4
app.get("/districts/:districtId/", async (request, response) => {
  const { districtId } = request.params;
  const query = `SELECT * FROM district WHERE district_id = ${districtId};`;
  const outPut = await db.get(query);
  const result = {
    districtId: outPut.district_id,
    districtName: outPut.district_name,
    stateId: outPut.state_id,
    cases: outPut.cases,
    cured: outPut.cured,
    active: outPut.active,
    deaths: outPut.deaths,
  };
  response.send(result);
});
//API-5
app.delete("/districts/:districtId/", async (request, response) => {
  const { districtId } = request.params;
  const query = `DELETE FROM district WHERE district_id = ${districtId};`;
  const outPut = await db.run(query);
  response.send("District Removed");
});
//API-6
app.put("/districts/:districtId/", async (request, response) => {
  const { districtId } = request.params;
  const { districtName, stateId, cases, cured, active, deaths } = request.body;
  const query = `UPDATE district SET district_name = '${districtName}', state_id = '${stateId}', cases = '${cases}', cured = '${cured}', active = '${active}', deaths = '${deaths}' WHERE district_id = ${districtId};`;
  const outPut = await db.run(query);
  response.send("District Details Updated");
});
//API-7
app.get("/states/:stateId/stats/", async (request, response) => {
  const { stateId } = request.params;
  const query = `SELECT SUM(cases) AS ca, SUM(cured) AS cu, SUM(active) AS ac, SUM(deaths) AS de FROM district WHERE state_id = ${stateId} GROUP BY state_id;`;
  const outPut = await db.get(query);
  const result = {
    totalCases: outPut.ca,
    totalCured: outPut.cu,
    totalActive: outPut.ac,
    totalDeaths: outPut.de,
  };
  response.send(result);
});
//API-8
app.get("/districts/:districtId/details/", async (request, response) => {
  const { districtId } = request.params;
  const query = `SELECT * FROM state INNER JOIN district ON state.state_id = district.state_id WHERE district_id = ${districtId};`;
  const outPut = await db.get(query);
  const result = { stateName: outPut.state_name };
  response.send(result);
});
module.exports = app;
