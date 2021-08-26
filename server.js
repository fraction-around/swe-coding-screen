const express = require('express');
const bodyParser = require('body-parser');

const createServer = () => {
  const app = express();

  app.use(bodyParser.json());

  const DEFAULT_LIMIT = 10;

  const users = [];
  const statuses = [];

  app.post('/users', (req, res) => {
    const id = users.length === 0 ? 1 : users[users.length - 1].userId + 1; // Auto increment ID
    const user = {
      userId: id,
      userSecret: 'secret', // Ideally read the password from body and store it after hashing
      ...req.body, // Add whatever data present in the body for now
    };

    users.push(user);

    res.json(user);
  });

  app.get('/statuses/:userId?', (req, res) => {
    const userId = Number(req.params.userId);

    const filtered = Number.isNaN(userId)
      ? statuses.slice(0)
      : statuses.filter((status) => status.userId === userId);

    let limit = Number(req.query.limit);
    let offset = Number(req.query.offset);

    if (Number.isNaN(limit) || limit < 1) {
      limit = DEFAULT_LIMIT;
    }

    if (Number.isNaN(offset) || offset < 0) {
      offset = filtered.length - limit;
    }

    const result = filtered.slice(offset, offset + limit);

    // Do not sort in decending order if offset is present
    if (isFinite(req.query.offset) === false) {
      result.sort((a, b) => b.createdAt - a.createdAt);
    }

    res.json(result);
  });

  app.post('/statuses', (req, res) => {
    const userId = Number(req.body.userId);
    const statusMessage = req.body.statusMessage;
    const status = { userId, statusMessage, createdAt: new Date().getTime() };

    statuses.push(status);

    res.json(status);
  });

  return app;
};

module.exports = createServer;
