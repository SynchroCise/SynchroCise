const passport = require('passport');
const localStrategy = require('passport-local').Strategy;
const JWTstrategy = require('passport-jwt').Strategy;
const { createUserLogin, getUserByEmail, isValidPassword } = require('./users.js');

var cookieExtractor = function(req) {
  var token = null;
  if (req && req.cookies) token = req.cookies['jwt'];
  return token;
};

const validateEmail = (email) => {
  const re = /\S+@\S+\.\S+/;
  return re.test(email);
}

passport.use(
    'signup',
    new localStrategy(
      {
        usernameField: 'email',
        passwordField: 'password',
        passReqToCallback: true
      },
      async (req, email, password, done) => {
        try {
          const displayName = req.body.displayName;
          if (!displayName || displayName == '') return done(null, false, {error: true, message: 'Missing displayName'});
          if (!validateEmail(email)) return done(null, false, {error: true, message: 'Invalid Email'});

          let {user} = await createUserLogin({ email, password, displayName });
          if (!user) {
              return done(null, false, {error: true, message: 'Email already used'})
          } 
          return done(null, user, {message: 'Signed In Successfully!'});
        } catch (error) {
          done(error);
        }
      }
    )
  );

passport.use(
    'login',
    new localStrategy(
      {
        usernameField: 'email',
        passwordField: 'password'
      },
      async (email, password, done) => {
        try {
            let user = await getUserByEmail(email);
            if (!user || user.length == 0) {
                return done(null, false, {error: true, message: 'User not found' });
            }

            user = user[0];
            const validate = await isValidPassword(user, password);
            if (!validate) {
                return done(null, false, {error: true, message: 'Wrong Password' });
            }

            return done(null, user, { message: 'Logged in Successfully' });
        } catch (error) {
          return done(error);
        }
      }
    )
  );

  passport.use(
    new JWTstrategy(
      {
        secretOrKey: process.env.JWT_SECRET,
        jwtFromRequest: cookieExtractor
      },
      async (token, done) => {
        try {
          return done(null, token.user);
        } catch (error) {
          done(error);
        }
      }
    )
  );