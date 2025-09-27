const jwt = require("jsonwebtoken");

const isAdmin = (req, res, next) => {
  const token = req.headers["authorization"]?.split(" ")[1];
  if (!token) return res.status(401).json({ message: "Token não fornecido" });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || "SECRET_KEY_DO_JWT");
    if (decoded.role !== "admin") {
      return res.status(403).json({ message: "Acesso negado, admin apenas" });
    }
    req.user = decoded; // mantém o usuário no request
    next();
  } catch (err) {
    res.status(401).json({ message: "Token inválido" });
  }
};

module.exports = isAdmin;
