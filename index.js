import express from "express";
import * as dotenv from "dotenv";
import { MongoClient } from "mongodb";

dotenv.config();
const app = express();
app.use(express.json());

const PORT = process.env.PORT;
const MONGO_URL = process.env.MONGO_URL;

const client = new MongoClient(MONGO_URL);
await client.connect();
console.log("MongoDB is Live 🎉🎉🎉");

//HomePage
app.get("/", function (req, res) {
  res.send("<h1>🎉🎉🎉 Hello,Welcome to Hall Booking Server 🎉🎉🎉<h1>");
});

app.listen(PORT, () => {
  console.log(`server is started ${PORT}🎉🎉🎉`);
});

//CREATE_ROOM

app.post("/createcustomer", async (req, res) => {
  //db.collection.insertMany() --> rooms details
  let data = req.body;
  let result = await client
    .db("hallbook")
    .collection("customer")
    .insertMany(data);
  res.send("Success");
  console.log(result);
});

// show customer details
app.get("/customer", async (req, res) => {
  const data = req.body;
  const result = await client
    .db("hallbook")
    .collection("customer")
    .find({})
    .toArray();
  res.send(result);
});

//Booking a Room WITH Customer Details
app.post("/createroom", async (req, res) => {
  //db.collection.insertMany() --> rooms details
  let data = req.body;
  let result = await client.db("hallbook").collection("rooms").insertMany(data);
  res.send("Success");
  console.log(result);
});

// show room details
app.get("/rooms", async (req, res) => {
  const data = req.body;
  const result = await client
    .db("hallbook")
    .collection("rooms")
    .find({})
    .toArray();
  res.send(result);
});

//ROOM DATA WITH Booked DETAILS

app.get("/roomdata", async (req, res) => {
  let roomdata = req.body;
  const result = await client
    .db("hallbook")
    .collection("rooms")
    .aggregate([
      {
        $lookup: {
          from: "customer",
          localField: "room_id",
          foreignField: "customer_id",
          as: "Booking_Details",
          pipeline: [
            {
              $project: {
                customer_name: 1,
                date: 1,
                start: 1,
                end: 1,
                status: 1,
              },
            },
          ],
        },
      },
    ])
    .toArray();
  result.length > 0
    ? res.send(result)
    : res.status(401).send({ message: "No data Found" });
});

//List Customer Data
app.get("/customerdata", async (req, res) => {
  let roomdata = req.body;
  const result = await client
    .db("hallbook")
    .collection("customer")
    .aggregate([
      {
        $lookup: {
          from: "rooms",
          as: "Room_Name",
          pipeline: [{ $project: { roomName: 1 } }],
        },
      },
    ])
    .toArray();
  result.length > 0
    ? res.send(result)
    : res.status(401).send({ message: "No data Found" });
});
