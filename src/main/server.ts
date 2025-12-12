import { SERVER_BASE_URL, SERVER_PORT } from '@shared/data';
import { createServer } from 'node:http';
import { Source } from '@shared/types';

function runServer() {
  createServer(async (req, res) => {
    if (req.method !== 'GET') {
      res.writeHead(405);
      res.end();
      return;
    }
    const reqUrl = req.url;
    if (reqUrl) {
      const parsedUrl = new URL(reqUrl, SERVER_BASE_URL);
      if (parsedUrl.pathname === '/embed') {
        const urlToEmbed = parsedUrl.searchParams.get('url');
        const source = parsedUrl.searchParams.get('source') as Source;

        if (!urlToEmbed || !source) {
          res.writeHead(400);
          res.end('Missing url or source');
          return;
        }

        if (source === 'youtube-video' || source === 'youtube-music') {
          const videoOrMusicId = new URL(urlToEmbed).searchParams.get('v');
          const embedUrl = `https://www.youtube.com/embed/${videoOrMusicId}`;
          const embedHtml = getEmbedHtml(embedUrl);
          res.writeHead(200, { 'Content-Type': 'text/html' });
          res.end(embedHtml);
          return;
        }
      }
      res.writeHead(404);
      res.end('Not found');
      return;
    }
  }).listen(SERVER_PORT, () => {
    console.log(`Server running on ${SERVER_PORT}`);
  });
}

function getEmbedHtml(embedUrl: string) {
  return `
  <!DOCTYPE html>
<html style="margin:0; padding:0; background:black;">
  <head>
    <meta charset="UTF-8" />
    <style>
      html, body {
        margin: 0;
        padding: 0;
        background: black;
      }
      iframe {
        aspect-ratio: 16/9;
        border: black;
        outline: black;
      }
    </style>
  </head>
  <body>
    <iframe
      src="${embedUrl}"
      allowfullscreen
      frameborder="0"
      scrolling="no"
    ></iframe>
  </body>
</html>
  `;
}

export default runServer;
