require("dotenv").config();
const express = require("express");
const app = express();
const bp = require("body-parser");
const bcrypt = require("bcrypt");
const passport = require("passport");
const flash = require("express-flash");
const session = require("express-session");
const mongo = require("./mongodb/mongo");
const clientSchema = require("./mongodb/schema");

//whatsapp-web
const qr = require("qrcode");
const { Client } = require("whatsapp-web.js");

//socket.io
const server = require("http").createServer(app);
const io = require("socket.io")(server, { cors: { origin: "*" } });

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
  const client = new Client({
    puppeteer: {
      args: ["--no-sandbox"],
    },
  });
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
    let filterData = {};
    console.log(data);
    if (data.nazione == "ALL") {
    } else {
      filterData["nazione"] = data.nazione;
    }
    if (data.comune == "Tutte") {
    } else {
      filterData["comune"] = data.comune;
    }
    if (data.lavoro == "ALL") {
    } else {
      filterData["lavoro"] = data.lavoro;
    }
    if (data.all == false) {
      await clientSchema.find(filterData, (err, db) => {
        if (!err) {
          console.log(db);
          clients = db;
          socket.emit("filteredObj", db);
        }
      });
    } else {
      await clientSchema.find({}, (err, db) => {
        if (err) {
          console.log(err);
        } else {
          clients = db;
          socket.emit("filteredObj", db);
        }
      });
    }
  });
  console.log("fuck of bini");
  socket.on("generate_qr", () => {
    client.on("qr", async (codeqr) => {
      desiqr = await codeqr;
      console.log("qr code from client", desiqr);
      qr.toDataURL(desiqr, (err, src) => {
        if (err) console.log("Here was the error 147 server", err);
        // Let us return the QR code image as our response and set it to be the source used in the webpage

        socket.emit("qr_ready", src);
      });
    });
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
  });

  client.initialize();
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

const port = process.env.PORT || 3000;
server.listen(port, () => console.log("Server at", port, "on", new Date()));
