const jwt = require("jsonwebtoken");
const User = require("../models/userModel");

const protect = async (req, res, next) => {
  let token;
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    token = req.headers.authorization.split(" ")[1];

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET || "SECRET_KEY_DO_JWT");
      req.user = await User.findById(decoded.id).select("-senha"); // não retorna senha
      next();
    } catch (err) {
      return res.status(401).json({ success: false, message: "Token inválido" });
    }
  }

  if (!token) {
    return res.status(401).json({ success: false, message: "Token não fornecido" });
  }
};

module.exports = { protect };
