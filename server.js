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
app.use(bodyParser.urlencoded({ extended: true }));

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

io.on('connection', (socket) => {
    socket.on('message', (msg) => {
        console.log('*----*********************************************************************************************',msg);
        socket.broadcast.emit('message-broadcast', msg);
    });
    console.log('-*-*-*-*-*-*-*-*-*-*-*-*-*-*-', socket.id);
});
