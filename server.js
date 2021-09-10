require("dotenv").config();
const express = require("express");
const app = express();
const bp = require("body-parser");
const bcrypt = require("bcrypt");
const passport = require("passport");
const flash = require("express-flash");
const session = require("express-session");
const mongoose = require("mongoose");
const mongo = require("./mongodb/mongo");
const clientSchema = require("./mongodb/schema");

//Database
const connectToMongoDB = async () => {
  await mongo().then((mongoose) => {
    try {
      console.log("connected to Database");
    } catch (e) {
      console.log(e);
    }
  });
};

connectToMongoDB();

//socket.io
const server = require("http").createServer(app);
const io = require("socket.io")(server, { cors: { origin: "*" } });

//whatsapp-web
const qr = require("qrcode");
const { Client } = require("whatsapp-web.js");

//login

const user = [];
async function cryptPassword(x) {
  try {
    const hashedPassword = await bcrypt.hash("s", 10).then((x) => x);
    user.push({
      id: "090daa670e6a460da10ea89bba35ff6e",
      username: "s",
      password: hashedPassword,
    });
    return hashedPassword;
  } catch (error) {
    console.log(error);
  }
}
cryptPassword("s");

const initializePassport = require("./passport-config");
initializePassport(
  passport,
  (username) => {
    return user.find((user) => user.username === username);
  },
  (id) => user.find((user) => user.id === id)
);

const client = new Client();
app.set("view engine", "ejs");
app.use(express.static(__dirname + "/views"));
app.use(bp.urlencoded({ extended: false }));
app.use(bp.json());
app.use(flash());
app.use(
  session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
  })
);
app.use(passport.initialize());
app.use(passport.session());

//database
let clients = {};
let desiqr = "";

io.on("connection", (socket) => {
  console.log("socket id: " + socket.id);

  socket.on("ClientData", (data) => {
    let newClient = new clientSchema({
      cognome: data.cognome,
      nome: data.nome,
      telefono: data.telefono,
      nazione: data.nazione,
      comune: data.comune,
      lavoro: data.lavoro,
    });
    newClient.save((err, client) => {
      if (err) {
        console.log(err);
      } else {
        socket.emit("postMessage", "Cliente aggiunto");
      }
    });
  });

  socket.on("filter", async (data) => {
    console.log(data);
    if (data.nazione == "Tutti") {
      data.nazione = "";
    }
    if (data.comune == "Tutti") {
      data.comune = "";
    }
    if (data.lavoro == "Tutti") {
      data.lavoro = "";
    }
    if (!data.all) {
      clientSchema.find(
        {
          nazione: data.nazione,
          comune: data.comune,
          lavoro: data.lavoro,
        },
        (err, db) => {
          if (!err) {
            console.log(db);
            clients = db;
            socket.emit("filteredObj", db);
          }
        }
      );
    } else {
      await clientSchema.find({}, (err, db) => {
        if (err) {
          console.log(err);
        } else {
          console.log(db);
          clients = db;
          socket.emit("filteredObj", db);
        }
      });
    }
  });

  socket.on("generate_qr", () => {
    if (desiqr == "") {
      client.on("qr", async (codeqr) => {
        try {
          desiqr = await codeqr;
          qr.toDataURL(desiqr, (err, src) => {
            if (err) res.send("Error occured");
            // Let us return the QR code image as our response and set it to be the source used in the webpage

            socket.emit("qr_ready", src);
          });
        } catch (error) {
          console.log("here si " + error);
        }
      });
    } else {
      qr.toDataURL(desiqr, (err, src) => {
        if (err) res.send("Error occured");
        // Let us return the QR code image as our response and set it to be the source used in the webpage

        socket.emit("qr_ready", src);
      });
    }
  });

  client.on("ready", () => {
    console.log("Client is ready!");
    socket.emit("connected");
    socket.on("sendMsg", (text) => {
      for (let i = 0; i < clients.length; i++) {
        const number = clients[i].telefono;
        console.log(number);
        // Getting chatId from the number.
        // we have to delete "+" from the beginning and add "@c.us" at the end of the number.
        const chatId = number.substring(1) + "@c.us";
        // Sending message.
        client.sendMessage(chatId, text);
        socket.emit("msgSent");
      }
    });
    // }
  });
});

//Routes

app.get("/login", checkNotAuthenticated, (req, res) => {
  res.render("login.ejs", { message: "" });
});

app.get("/", checkAuthenticated, (req, res) => {
  res.render("index");
});
app.get("/addClient", checkAuthenticated, (req, res) => {
  res.render("addClient", { src: "" });
});

app.get("/getClient", checkAuthenticated, (req, res) => {
  res.render("getClients");
});

app.post(
  "/login",
  passport.authenticate("local", {
    successRedirect: "/",
    failureRedirect: "/login",
    failureFlash: true,
  })
);

function checkAuthenticated(req, res, next) {
  if (req.isAuthenticated()) {
    return next();
  }
  res.redirect("/login");
}
function checkNotAuthenticated(req, res, next) {
  if (!req.isAuthenticated()) {
    return next();
  }
  res.redirect("/");
}

client.initialize();

const port = process.env.Port || 3000;
server.listen(port, () => console.log("Server at", port, "on", new Date()));
