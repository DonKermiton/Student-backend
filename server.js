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

const users = {
    User: [{
        User: {},
        socketID: []
    }],

}

io.on('connection', (socket) => {

    socket.on('subscribeToPost', (postId) => {
        socket.join(postId);
    });

    socket.on('post-events', (event) => {
        console.log(event);
        io.sockets.in(event.postId).emit('post-event', {text: 'test'});
        // console.log(event);
        // socket.to(event.postID).emit(event.data);
    })

    socket.on('user-connect', (User) => {
        let exists = false;
        if (users.User) {
            for (let i = 0; i < users.User.length; i++) {
                if (users.User[i].User.id === User.id) {
                    users.User[i].socketID.push(socket.id);
                    exists = true;
                    break;
                }
            }
        }

        socket.emit('user-connected', {socket: socket.id, users});

        if (!exists) {
            const userWithSocket = {User, socketID: [socket.id]};
            if (!users.User) {
                users.User = [];
            }
            users.User.push(userWithSocket);
        }
        socket.broadcast.emit('user-status-active', {
            User,
            socketID: socket.id,
            exists
        });
        // socket.broadcast.emit({User, socketID: socket.id});

    });

    socket.on('message', (msg) => {
        socket.broadcast.emit('message-broadcast', msg);
    });

    socket.on('send-privy-message', (msg) => {
        socket.to(msg.selectedToken).emit('send-privy-message', {
            from: msg.yourSocket,
            to: msg.selectedToken,
            message: msg.message
        });
        // socket.to(msg.userID.socketID).emit('send-privy-message', {msg, text: msg.message, socket: socket.id});
    });

    socket.on("disconnect", () => {
        console.log(typeof users.User);
        let i = 0;
        let j = 0;
        let isEmpty;

        for (const user of users.User) {
            for (const socketIDElement of user.socketID) {
                j++;
                if (socketIDElement === socket.id) {
                    console.log('_+_+_+_+_+_+_+_+_+_+_+__+_+_+_+_+_+_+_+_+_+_+__+_+_+_+_+_+_+_+_+_+_+__+_+_+_+_+_+_+_+_+_+_+_', socketIDElement);
                    user.socketID.splice(j, 1);
                    isEmpty = user.socketID.length === 0;

                    socket.broadcast.emit('user-status-inactive', {socket: socket.id, i, j, isEmpty});

                    return;
                }
            }
            j = 0;
            i++;
        }


    });


});

