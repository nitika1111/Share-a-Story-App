const express= require('express') // create simple express server
const mongoose= require('mongoose')
const dotenv= require('dotenv') // will contain config vars
const morgan= require('morgan')
const exphbs= require('express-handlebars')
const methodOverride= require('method-override')
const path= require('path')
const connectDB= require('./config/db')
const passport= require('passport')
const session= require('express-session')
const MongoStore= require('connect-mongo')

// Load config file
dotenv.config({ path: './config/config.env'})

// Passport config
require('./config/passport')(passport)

// Connect DB
connectDB()

const app= express()

// Body Parser middleware
app.use(express.urlencoded({ extended: false}))
app.use(express.json())

// Method Override to enable PUT and DELETE req methods
app.use(methodOverride((req, res) => {
    if (req.body && typeof req.body === 'object' && '_method' in req.body) {
      // look in urlencoded POST bodies and delete it
      let method = req.body._method
      delete req.body._method
      return method
    }
}))

// Logging set up for dev mode
if (process.env.NODE_ENV === 'development'){
    app.use(morgan('dev'))
}

// handlebars Helper
const { formatDate, truncate, stripTags, editIcon, select } = require('./helpers/hbs')

// Setup View Engine--> Express Handlebars
app.engine(
    '.hbs', 
    exphbs({ 
        helpers: {
            formatDate,
            truncate,
            stripTags,
            editIcon,
            select,
        },
        defaultLayout: 'main',
        extname: '.hbs'
    }));
app.set('view engine', '.hbs');

// Set express session middleware
app.use(session({
    secret: 'keyboard cat',
    resave: false,
    saveUninitialized: false,
    store: MongoStore.create({ mongoUrl: process.env.MONGO_URI})
}))


// Set Passport middleware
app.use(passport.initialize())
app.use(passport.session())

// Set global variable
app.use((req, res, next) => {
    res.locals.user = req.user || null
    next()
})

// Static Folder
app.use(express.static(path.join(__dirname, 'public')))

// Routes
app.use('/', require('./routes/index'))
app.use('/auth', require('./routes/auth'))
app.use('/stories', require('./routes/stories'))

// Setup PORT var
const PORT = process.env.PORT || 3000;

app.listen(PORT, 
    console.log(`Server Running in ${process.env.NODE_ENV} mode on port ${PORT}`)
    )