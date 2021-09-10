const LocalStrategy = require("passport-local").Strategy;
const bcrypt = require("bcrypt");

function initializePassport(passport, getUserByUsername, getUserById) {
  const authenticatedUser = async (username, password, done) => {
    const user = getUserByUsername(username);
    if (user == null) {
      console.log("user eror");
      return done(null, false, {
        message: "Paji non ci sono utenti con questo nome",
      });
    }
    try {
      //await bcrypt.compare(password, user.password
      let data = await bcrypt.compare(password, user.password);
      if (await bcrypt.compare(password, user.password)) {
        return done(null, user);
      } else {
        console.log("user eror");
        return done(null, false, {
          message: "Paji Password sbagliato!",
        });
      }
    } catch (e) {
      return done(e);
    }
  };
  passport.use(
    new LocalStrategy({ usernameField: "username" }, authenticatedUser)
  );
  passport.serializeUser((user, done) => {
    return done(null, user.id);
  });
  passport.deserializeUser((id, done) => {
    return done(null, getUserById(id));
  });
}

module.exports = initializePassport;
