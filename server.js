const bodyParser = require('body-parser');
const app = require('express')();
const http = require('http').createServer(app);
const port = +process.env.PORT || 3000;
const io = require('socket.io')(http, {
    cors: {
        origin: '*',
    }
});


app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));

const Users = require('./routes/Users');
const Photos = require('./routes/Photo');
const Posts = require('./routes/Posts');
const Storage = require('./routes/storage');

app.use('/api/users', Users);
app.use('/api/photo', Photos);
app.use('/api/posts', Posts);
app.use('/api/storage', Storage);


http.listen(port, () => {
    console.log(`server is running on port ${port}`);
})

const users = []

io.on('connection', (socket) => {

    socket.on('user-connect', (User) => {
        console.log(User);
        users.push({User, socketID: socket.id});
        socket.emit('user-connected', users);
        // socket.broadcast.emit({User, socketID: socket.id});

    });

    socket.on('message', (msg) => {
        socket.broadcast.emit('message-broadcast', msg);
    });


    socket.on('create-message', (msg) => {
        console.log(msg);
    });

    socket.on("disconnect", () => {
        users.length = 0;
        console.log('sdfjsdjsdkjdskjfjksdhfjsdhfksdahfsdkjfhdsjkfsadhfgsdahfgasjdhfgjhsdfgjfhsghsdajfgd',socket.id); // undefined
    });

    console.log('-*-*-*-*-*-*-*-*-*-*-*-*-*-*-', socket.id);
});

io.on('disconnect', () => {
    console.log('*----*********************************************************************************************');
})
