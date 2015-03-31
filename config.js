module.exports = {
  mongoPath: "mongodb://" + process.env.MONGO_HOST + ":" + process.env.MONGO_PORT + "/" + process.env.MONGO_DB,
  port: process.env.PORT
};
