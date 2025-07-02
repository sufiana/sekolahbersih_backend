const passport = require("passport");
const LocalStrategy = require("passport-local").Strategy;
const GoogleStrategy = require("passport-google-oauth20").Strategy;
const bcrypt = require("bcryptjs");
const db = require("../config/db");
const Role = require("../models/Role");

passport.use(
  new LocalStrategy(
    {
      usernameField: "email",
      passwordField: "password",
    },
    async (email, password, done) => {
      try {
        const { rows } = await db.query(
          "SELECT * FROM users WHERE email = $1",
          [email]
        );

        if (rows.length === 0) {
          return done(null, false, { message: "Email not found" });
        }

        const user = rows[0];
        const isMatch = await bcrypt.compare(password, user.password_hash);

        if (!isMatch) {
          return done(null, false, { message: "Incorrect password" });
        }

        return done(null, user);
      } catch (err) {
        return done(err);
      }
    }
  )
);

// Google Strategy
passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: process.env.GOOGLE_CALLBACK_URL,
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        const email = profile.emails[0].value;
        const googleId = profile.id;
        const googleName = profile.displayName;

        const { rows: userByGoogleId } = await db.query(
          "SELECT * FROM users WHERE google_id = $1",
          [googleId]
        );
        if (userByGoogleId.length > 0) {
          return done(null, userByGoogleId[0]);
        }

        const { rows: userByEmail } = await db.query(
          "SELECT * FROM users WHERE email = $1",
          [email]
        );
        if (userByEmail.length > 0) {
          const {
            rows: [updatedUser],
          } = await db.query(
            `UPDATE users SET
              google_id = $1,
              google_email = $2,
              google_name = $3,
              last_login = NOW()
            WHERE id = $4
            RETURNING *`,
            [googleId, email, googleName, userByEmail[0].id]
          );
          return done(null, updatedUser);
        }

        // Jika user tidak ditemukan, insert dengan role 0 dan id_sekolah 0
        const {
          rows: [newUser],
        } = await db.query(
          `
  INSERT INTO users (
    username,
    email,
    google_id,
    google_email,
    google_name,
    role,
    id_sekolah,
    is_active,
    is_verified,
    last_login
  ) VALUES ($1, $2, $3, $4, $5, 0, 0, false, false, NOW())
  RETURNING *
`,
          [
            username, // ex: `${email.split('@')[0]}-${googleId.slice(0, 4)}`
            email,
            googleId,
            email,
            googleName,
          ]
        );

        // Kirim user tetapi nanti akan dicegat di callback
        return done(null, newUser);
      } catch (err) {
        console.error("Google Auth Error:", err);
        return done(err);
      }
    }
  )
);

// Serialization
passport.serializeUser((user, done) => {
  done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
  try {
    const { rows } = await db.query("SELECT * FROM users WHERE id = $1", [id]);
    done(null, rows[0]);
  } catch (err) {
    done(err);
  }
});

module.exports = passport;
