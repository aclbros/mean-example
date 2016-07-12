var express = require("express"),
    stylus = require("stylus"),
    bodyParser = require("body-parser"),
    logger = require("morgan"),
    mongoose = require("mongoose");
require("dotenv").load();

var env = process.env.NODE_ENV = process.env.NODE_ENV || "development";

var app = express();

function compile(str, path) {
    return stylus(str).set('filename', path);
}

app.set('views', __dirname + '/server/views');
app.set('view engine', 'jade');
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(stylus.middleware(
    {
        src: __dirname + '/public',
        compile: compile
    }
));
app.use(express.static(__dirname + '/public'));

mongoose.connect(process.env.MONGODB_URI);
var db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error...'));
db.on('open', function callback() {
    console.log('multivision db opened');
});
var messageSchema = mongoose.Schema({ message: String });
var Message = mongoose.model('Message', messageSchema);
var mongoMessage;
Message.findOne().exec(function(err, messageDoc) {
    if (err) {
        console.log('no results');
    } else {
        mongoMessage = messageDoc.message;
    }
});

app.get('/partials/:partialPath', function(req, res) {
    res.render('partials/' + req.params.partialPath);
});

app.get('*', function(req, res) {
    res.render('index', {
        mongoMessage: mongoMessage
    });
});

var port = process.env.PORT || 8080;
app.listen(port);
console.log("Listening on port " + port + "...");