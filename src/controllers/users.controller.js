import connection from "../database/database.connection.js";
export const usersController = {
  Signup: async (req, res) => {
    try {
      const { email } = req.body;
      const existingUser = await connection.query(
        "SELECT * FROM users WHERE email = $1",
        [email]
      );

      if (existingUser.rows.length > 0) {
        return res.status(409).json({ error: "Usuário já existe." });
      }

      const { name, password } = req.body;

      const insertQuery =
        "INSERT INTO users (name, email, password) VALUES ($1, $2, $3) RETURNING *";
      const values = [name, email, password];
      const newUser = await connection.query(insertQuery, values);

      res.status(201).json({ message: "Usuário criado com sucesso!" });
    } catch (err) {
      res
        .status(422)
        .json({ error: "Erro ao criar usuário.", details: err.message });
    }
  },
};
