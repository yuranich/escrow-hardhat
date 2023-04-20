var express = require("express");
var app = express();
var bodyParser = require("body-parser");
var { Client } = require("pg");
var cors = require("cors");

app.use(bodyParser.json());
app.use(cors());

app.get("/", function (req, res) {
  res.send("Welcome to the Escrow Dapp!");
});

app.post("/api/escrows", async function (req, res) {
  console.log("request body:", req.body);
  try {
    await saveToDB(req.body);
    res.status(200).json({ status: "CREATED" });
  } catch (e) {
    console.log(e);
    res.status(500).json({ status: "ERROR" });
  }
});

app.get("/api/escrows", async function (req, res) {
  try {
    const escrows = await getAllFromDB();
    console.log(escrows);
    res.status(200).json(escrows);
  } catch (e) {
    console.log(e);
    res.status(500).json({ status: "ERROR" });
  }
});

// Change the 404 message modifing the middleware
app.use(function (req, res, next) {
  res.status(404).send("Sorry, that route doesn't exist. Have a nice day :)");
});

// start the server in the port 3000 !
app.listen(3003, function () {
  console.log("Server is listening on port 3003...");
});

async function saveToDB(escrow) {
  const statement =
    "INSERT INTO contracts(signer, contract, arbiter, beneficiary, value) VALUES($1, $2, $3, $4, $5)";
  const client = new Client({
    database: "postgres",
  });
  await client.connect();

  const res = await client.query(statement, Object.values(escrow));
  console.log(`updated ${res.rowCount} rows`);
  await client.end();
}

async function getAllFromDB() {
  const statement = "SELECT * FROM contracts";
  const client = new Client({
    database: "postgres",
  });
  await client.connect();

  const res = await client.query(statement);
  console.log(res);
  await client.end();
  return res.rows;
}
