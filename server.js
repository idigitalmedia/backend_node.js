require('rootpath')();
const express = require('express');
const app = express();
const cors = require('cors');
const bodyParser = require('body-parser');
const errorHandler = require('_middleware/error-handler');
// const tfa = require('./routes/tfa');

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(cors());
var routes = require('./users/todoListRoutes');
routes(app);
// api routes
app.use('/users', require('./users/users.controller'));
// global error handler
app.use(errorHandler);
// app.use(tfa);

// start server
const port = process.env.NODE_ENV === 'production' ? (process.env.PORT || 80) : 4000;
app.listen(port, () => console.log('Server listening on port ' + port));