import connection from "../database/database.connection.js";

export function validateToken() {
  return async (req, res, next) => {
    const token = req.headers.authorization?.replace("Bearer ", "");
    console.log(token);

    try {
      const query = `
        SELECT * FROM users
        WHERE token = $1
      `;

      const result = await connection.query(query, [token]);

      const user = result.rows[0];

      if (!user) {
        return res.status(401).json({ error: "Usuário inválido" });
      }

      next();
    } catch (error) {
      return res.status(500).json({ error: "Token inválido" });
    }
  };
}
