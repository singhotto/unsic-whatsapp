require("dotenv").config();
const mongoose = require("mongoose");
const mongoPath = `mongodb+srv://singh-8:${process.env.MONGO_PASSWORD}@singhotto.olz8c.mongodb.net/cafBoretto?retryWrites=true&w=majority`;
module.exports = async () => {
  await mongoose.connect(mongoPath, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });

  return mongoose;
};
