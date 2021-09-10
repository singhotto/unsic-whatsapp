const mongoose = require("mongoose");

const reqData = {
  type: String,
  required: true,
};

const clientSchema = mongoose.Schema({
  cognome: reqData,
  nome: reqData,
  telefono: reqData,
  nazione: reqData,
  comune: reqData,
  lavoro: reqData,
  date: { type: Date, default: Date.now },
});

module.exports = mongoose.model("clients", clientSchema);
