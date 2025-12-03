const authorize = (authorizedRole) => {
  return (req, res, next) => {
    if (!req.user) {
      const err = new Error("User doesn't exist");
      err.statusCode = 401;
      throw err;
    }
    if (req.user.role !== authorizedRole) {
      const err = new Error("You aren't Authorized!");
      err.statusCode = 403;
      throw err;
    }
    next();
  };
};

module.exports = { authorize };
