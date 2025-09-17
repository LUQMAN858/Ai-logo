const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const fs = require('fs-extra');
const { v4: uuidv4 } = require('uuid');
const path = require('path');

const app = express();
app.use(cors());
app.use(bodyParser.json());
app.use(express.static('public'));

const STORAGE = path.join(__dirname, 'storage');
fs.ensureDirSync(STORAGE);

function safeText(t){ return (t||'').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;'); }

app.post('/api/generate', (req, res) => {
  const prompt = safeText(req.body.prompt || 'Logo');
  const variations = [];
  for(let i=0;i<10;i++){
    const id = uuidv4();
    const hue = Math.floor(Math.random()*360);
    const svg = `<?xml version="1.0" encoding="utf-8"?>\n<svg xmlns="http://www.w3.org/2000/svg" width="600" height="400" viewBox="0 0 600 400">\n  <rect width="100%" height="100%" fill="hsl(${hue},65%,12%)"/>\n  <g transform=\"translate(50,70)\">\n    <circle cx=\"100\" cy=\"100\" r=\"80\" fill=\"hsl(${(hue+40)%360},70%,45%)\" opacity=\"0.9\"/>\n    <rect x=\"220\" y=\"40\" width=\"180\" height=\"180\" rx=\"22\" fill=\"hsl(${(hue+120)%360},65%,45%)\" opacity=\"0.85\"/>\n    <text x=\"300\" y=\"320\" font-family=\"Segoe UI, Roboto, Arial\" font-size=\"36\" fill=\"#ffffff\" text-anchor=\"middle\">${prompt} ${i+1}</text>\n  </g>\n</svg>`;
    const filename = id + '.svg';
    fs.writeFileSync(path.join(STORAGE, filename), svg, 'utf8');
    variations.push({ id, svg });
  }
  res.json({ success:true, variations });
});

app.get('/api/download/:id', (req, res) => {
  const id = req.params.id;
  const filepath = path.join(STORAGE, id + '.svg');
  if(!fs.existsSync(filepath)) return res.status(404).send('File not found');
  res.setHeader('Content-Type', 'image/svg+xml');
  res.setHeader('Content-Disposition', 'attachment; filename="logo.svg"');
  res.send(fs.readFileSync(filepath, 'utf8'));
});

app.get('/api/health', (req,res)=> res.json({ok:true}));

const PORT = process.env.PORT || 3000;
app.listen(PORT, ()=> console.log('Server running on port', PORT));