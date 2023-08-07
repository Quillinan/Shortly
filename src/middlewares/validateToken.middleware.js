export function validateToken() {
  return (req, res, next) => {
    const token = req.headers.authorization?.replace("Bearer ", "");

    try {
      const query = `
      SELECT * FROM users
      WHERE token = $1
    `;

      const result = pool.query(query, [token]);

      const user = result.rows[0];

      if (!user) {
        return res.status(401).json({ error: "Usuário inválido" });
      }

      req.user = user;

      next();
    } catch (error) {
      return res.status(500).json({ error: "Token inválido" });
    }
  };
}
