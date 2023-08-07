import connection from "../database/database.connection.js";
import { nanoid } from "nanoid";

export const urlsController = {
  Shorten: async (req, res) => {
    try {
      const { url } = req.body;

      const newShortUrl = nanoid(8);

      const insertQuery =
        'INSERT INTO urls (url, "shortUrl") VALUES ($1, $2) RETURNING id, "shortUrl"';
      const values = [url, newShortUrl];
      const newUrl = await connection.query(insertQuery, values);

      const { id, shortUrl } = newUrl.rows[0];

      res.status(201).json({
        message: "URL reduzida criada com sucesso!",
        data: {
          id,
          shortUrl,
        },
      });
    } catch (err) {
      res
        .status(422)
        .json({ error: "Erro ao criar URL reduzida.", details: err.message });
    }
  },
};
