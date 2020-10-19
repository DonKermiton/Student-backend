const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const app = express();
const port = process.env.PORT || 3000;


app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

const Users = require('./routes/Users');
const Photos = require('./routes/Photo');
const Posts = require('./routes/Posts');

app.use('/users', Users);
app.use('/photo', Photos);
app.use('/posts', Posts);

app.listen(port, () => {
    console.log(`server is running on port ${port}`);
})
