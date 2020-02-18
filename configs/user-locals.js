module.exports = (req, res, next) => {
  res.locals.user = req.user;
  res.locals.port = process.env.PORT;
  next();
};
