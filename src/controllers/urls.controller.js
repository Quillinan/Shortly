import connection from "../database/database.connection.js";
import { nanoid } from "nanoid";

export const urlsController = {
  shorten: async (req, res) => {
    try {
      const { url } = req.body;
      const { id: idCreator } = req.user;

      const newShortUrl = nanoid(8);

      const insertQuery =
        'INSERT INTO urls (url, "shortUrl", "idCreator") VALUES ($1, $2, $3) RETURNING id, "shortUrl"';
      const values = [url, newShortUrl, idCreator];
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

      const updateQuery = `
        UPDATE urls
        SET "visitCount" = "visitCount" + 1
        WHERE "shortUrl" = $1
      `;
      await connection.query(updateQuery, [shortUrl]);

      // Redirecione o usuário para a URL completa
      res.redirect(fullUrl);
    } catch (error) {
      res.status(500).json({
        error: "Erro ao redirecionar para o URL completo",
        details: error.message,
      });
    }
  },
  deleteUrl: async (req, res) => {
    try {
      const { id } = req.params;
      const { id: idCreator } = req.user;

      const queryCheckCreator = `
        SELECT "idCreator" FROM urls
        WHERE id = $1
      `;
      const resultCheckCreator = await connection.query(queryCheckCreator, [
        id,
      ]);

      const urlCreatorId = resultCheckCreator.rows[0]?.idCreator;

      if (!urlCreatorId || urlCreatorId !== idCreator) {
        return res.status(401).json({ error: "Não autorizado" });
      }

      const queryCheckUrl = `
        SELECT * FROM urls
        WHERE id = $1
      `;
      const resultCheckUrl = await connection.query(queryCheckUrl, [id]);

      if (resultCheckUrl.rows.length === 0) {
        return res.status(404).json({ error: "URL não encontrada" });
      }

      const deleteQuery = `
        DELETE FROM urls
        WHERE id = $1
      `;
      await connection.query(deleteQuery, [id]);

      res.status(204).end();
    } catch (error) {
      res
        .status(500)
        .json({ error: "Erro ao excluir a URL", details: error.message });
    }
  },
  getRanking: async (_, res) => {
    try {
      const queryRanking = `
        SELECT u.id, u.name, COUNT(u2.id) AS "linksCount", SUM(u2."visitCount") AS "visitCount"
        FROM users u
        LEFT JOIN urls u2 ON u.id = u2."idCreator"
        GROUP BY u.id, u.name
        ORDER BY "visitCount" ASC
        LIMIT 10
      `;
      const resultRanking = await connection.query(queryRanking);
      const ranking = resultRanking.rows;

      res.status(200).json(ranking);
    } catch (error) {
      res
        .status(500)
        .json({ error: "Erro ao obter o ranking", details: error.message });
    }
  },
};
