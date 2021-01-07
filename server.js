const bodyParser = require('body-parser');
const app = require('express')();
const http = require('http').createServer(app);
const port = +process.env.PORT || 3000;
const io = require('socket.io')(http, {
    cors: {
        origin: 'http://localhost:4200',
        methods: ["GET", "POST"]
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
        socket.emit('user-connected', users);
        users.push({User, socketID: socket.id});
        socket.broadcast.emit('user-status-active', {User, socketID: socket.id});

        // socket.broadcast.emit({User, socketID: socket.id});

    });

    socket.on('message', (msg) => {
        socket.broadcast.emit('message-broadcast', msg);
    });


    socket.on('create-message', (msg) => {
        console.log(msg);
    });

    socket.on('send-privy-message', (msg) => {
        // socket.broadcast.to(msg.userID.socketID).emit('send-privy-message', msg.message);
        //  socket.emit('send-privy-message', msg.message);
        // socket.broadcast.to(msg.userID.socketID).emit('send-privy-message', msg);
        console.log('+_+_+_+_+_+_+_+_+_+_+_+_+_+_+_+_+_+_+_+_+_+_+_+_', msg.message);
        socket.to(msg.userID.socketID).emit('send-privy-message', {msg, text: msg.message, socket: socket.id});
        // socket.broadcast.to(msg.userID.socketID).emit('send-privy-message', msg);
        // io.socket.to(msg.userID.socketID).emit('send-privy-message', msg);
        // io.sockets.emit('send-privy-message', msg.message)
    });

    socket.on("disconnect", () => {
        console.log('_+_+_+_+_+_+_+_+_+_+_+_+_+_+_+_+_+_+_+_+_+_+_+_+_+_+_+_+_+_+_+_+_+_+_+_+_+_+_+_+_+_+_+_+_+_+_+_+_+_');
        for (let i = 0; i < users.length; i++) {
            if (users[i].socketID === socket.id) {
                socket.broadcast.emit('user-status-inactive', i);
                users.splice(i, 1);
            }
        }

    });

    console.log('-*-*-*-*-*-*-*-*-*-*-*-*-*-*-', socket.id);
});

io.on('disconnect', () => {
    console.log('*----*********************************************************************************************');
})
