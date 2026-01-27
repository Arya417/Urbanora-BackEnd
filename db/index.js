const mongoose = require('mongoose');

mongoose
  .connect(`mongodb://localhost:27017/${process.env.DEV_DB}`)
  .then(() => {
    console.log('DB connected');
  })
  .catch(e => {
    console.log(e);
  });

module.exports = mongoose;
