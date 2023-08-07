import connection from "../database/database.connection.js";
import { nanoid } from "nanoid";

export const urlsController = {
  shorten: async (req, res) => {
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
  getUrlById: async (req, res) => {
    try {
      const { id } = req.params;

      const query = `
        SELECT id, "shortUrl", url FROM urls
        WHERE id = $1
      `;
      const result = await connection.query(query, [id]);

      const urlDetails = result.rows[0];

      if (!urlDetails) {
        return res.status(404).json({ error: "URL não encontrada" });
      }

      res.status(200).json(urlDetails);
    } catch (error) {
      res.status(500).json({
        error: "Erro ao obter detalhes da URL",
        details: error.message,
      });
    }
  },
  openUrl: async (req, res) => {
    try {
      const { shortUrl } = req.params;

      const query = `
        SELECT url FROM urls
        WHERE "shortUrl" = $1
      `;
      const result = await connection.query(query, [shortUrl]);

      const urlDetails = result.rows[0];

      if (!urlDetails) {
        return res.status(404).json({ error: "URL encurtada não encontrada" });
      }

      const fullUrl = urlDetails.url;
      res.redirect(fullUrl);

      const updateQuery = `
        UPDATE urls
        SET visitcount = visitcount + 1
        WHERE "shortUrl" = $1
      `;
      await connection.query(updateQuery, [shortUrl]);
    } catch (error) {
      res.status(500).json({
        error: "Erro ao redirecionar para o URL completo",
        details: error.message,
      });
    }
  },
};
