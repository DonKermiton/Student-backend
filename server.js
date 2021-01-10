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
app.use(bodyParser.urlencoded({
    extended: true
}));

const Users = require('./routes/Users');
const Photos = require('./routes/Photo');
const Posts = require('./routes/Posts');
const Storage = require('./routes/storage');
const {
    setInterval
} = require('timers');

app.use('/api/users', Users);
app.use('/api/photo', Photos);
app.use('/api/posts', Posts);
app.use('/api/storage', Storage);


http.listen(port, () => {
    console.log(`server is running on port ${port}`);
})

const users = []
timeoutHandler = true;
io.on('connection', (socket) => {

    socket.on('user-connect', (User) => {
        
        users.push({
            User,
            socketID: socket.id
        });
        socket.emit('user-connected', {
            socket: socket.id,
            users
        });

        // TODO socket.broadcast to all live user (for while send whole array)
        // FIXME 
        
        socket.broadcast.emit('user-status-active', {
            socket: socket.id,
            users
        });
    });

    socket.on('message', (msg) => {
        socket.broadcast.emit('message-broadcast', msg);
    });


    socket.on('create-message', (msg) => {
        console.log(msg);
    });

    socket.on('send-privy-message', (msg) => {
        console.log('+_+_+_+_+_+_+_+_+_+_+_+_+_+_+_+_+_+_+_+_+_+_+_+_', msg.message);
        socket.to(msg.userID.socketID).emit('send-privy-message', {
            msg,
            text: msg.message,
            socket: socket.id
        });
    });

    socket.on('remove-socket', () => {
        for (let i = 0; i < users.length; i++) {
            if (users[i].socketID === socket.id) {
                users.splice(i, 1);
                console.log(users);
            }
            socket.broadcast.emit('user-status-active', users);
        }
    })

    socket.on("disconnect", () => {
        console.log('_+_+_+_+_+_+_+_+_+_+_+_+_+_+_+_+_+_+_+_+_+_+_+_+_+_+_+_+_+_+_+_+_+_+_+_+_+_+_+_+_+_+_+_+_+_+_+_+_+_');
        for (let i = 0; i < users.length; i++) {
            if (users[i].socketID === socket.id) {
                users.splice(i, 1);
                console.log(users);
            }
        }
        socket.broadcast.emit('user-status-active', users);
    });

    console.log('-*-*-*-*-*-*-*-*-*-*-*-*-*-*-', socket.id);
});

io.on('disconnect', () => {
    console.log('*----*********************************************************************************************');
})