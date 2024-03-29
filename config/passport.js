const GoogleStrategy= require('passport-google-oauth20').Strategy
const mongoose= require('mongoose')
const User = require('../models/User')

module.exports= function(passport){
    passport.use(new GoogleStrategy({
        clientID: process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        callbackURL: '/auth/google/callback',
    },
    async (accessToken, refreshToken, profile, done) => {
        console.log(profile)
        const theUser= {
            googleId: profile.id,
            displayName: profile.displayName,
            firstName: profile.name.givenName,
            lastName: profile.name.familyName,
            image: profile.photos[0].value
        }

        try {
            let dbUser= await User.findOne({ googleId: profile.id })
            
            if(dbUser) {
                done(null, dbUser)
            } else {
                dbUser= await User.create(theUser)
                done(null, dbUser)    
            }
        } catch (err) {
            console.error(err)
        }
    }))

    passport.serializeUser((user, done)=> 
        done(null, user.id)
    );
    
    passport.deserializeUser((id, done)=> 
        User.findById(id, (err, user)=> done(err, user))
    )
}