import connection from "../database/database.connection.js";
import bcrypt from "bcrypt";
import { v4 as uuid } from "uuid";

export const usersController = {
  signup: async (req, res) => {
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

      const saltRounds = 10;
      const hashedPassword = await bcrypt.hash(password, saltRounds);

      const insertQuery =
        "INSERT INTO users (name, email, password) VALUES ($1, $2, $3) RETURNING *";
      const values = [name, email, hashedPassword];
      const newUser = await connection.query(insertQuery, values);

      res.status(201).json({ message: "Usuário criado com sucesso!" });
    } catch (err) {
      res
        .status(422)
        .json({ error: "Erro ao criar usuário.", details: err.message });
    }
  },
  signin: async (req, res) => {
    try {
      const { email, password } = req.body;
      const existingUser = await connection.query(
        "SELECT * FROM users WHERE email = $1",
        [email]
      );

      if (existingUser.rows.length === 0) {
        return res.status(401).json({ error: "Usuário não existe." });
      }

      const user = existingUser.rows[0];
      const passwordMatch = await bcrypt.compare(password, user.password);

      if (!passwordMatch) {
        return res.status(401).json({ error: "Senha incorreta." });
      }

      const token = uuid();
      const updateQuery = "UPDATE users SET token = $1 WHERE id = $2";
      const values = [token, user.id];
      await connection.query(updateQuery, values);

      res.status(200).json({ token: token });
    } catch (err) {
      res
        .status(422)
        .json({ error: "Erro ao fazer login.", details: err.message });
    }
  },
  getUserUrls: async (req, res) => {
    try {
      const { id: userId } = req.user;

      const queryUser = `
        SELECT id, name FROM users
        WHERE id = $1
      `;
      const resultUser = await connection.query(queryUser, [userId]);
      const user = resultUser.rows[0];

      if (!user) {
        return res.status(404).json({ error: "Usuário não encontrado" });
      }

      const queryTotalVisitCount = `
        SELECT SUM("visitCount") as "totalVisitCount" FROM urls
        WHERE "idCreator" = $1
      `;
      const resultTotalVisitCount = await connection.query(
        queryTotalVisitCount,
        [userId]
      );
      const totalVisitCount =
        resultTotalVisitCount.rows[0]?.totalVisitCount || 0;

      const queryUserUrls = `
        SELECT id, "shortUrl", url, "visitCount" FROM urls
        WHERE "idCreator" = $1
      `;
      const resultUserUrls = await connection.query(queryUserUrls, [userId]);
      const userUrls = resultUserUrls.rows;

      const response = {
        id: user.id,
        name: user.name,
        visitCount: totalVisitCount,
        shortenedUrls: userUrls,
      };

      res.status(200).json(response);
    } catch (error) {
      res.status(500).json({
        error: "Erro ao obter os dados do usuário",
        details: error.message,
      });
    }
  },
};
