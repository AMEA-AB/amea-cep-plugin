const express = require('express') as typeof import('express');
const cors = require('cors') as typeof import('cors');

const app = express();
app.use(express.json());
app.use(cors());

app.get('/ping', (_req, res) => {
  res.send('pong');
});

app.listen(3001);
