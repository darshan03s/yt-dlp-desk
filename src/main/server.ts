import { SERVER_BASE_URL, SERVER_PORT } from '@shared/data';
import { createReadStream, stat } from 'node:fs';
import { createServer } from 'node:http';
import { promisify } from 'node:util';
import { downloadHistoryOperations } from './utils/dbUtils';
import logger from '@shared/logger';
import mime from 'mime-types';
import { Source } from '@shared/types';

const statAsync = promisify(stat);

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
      // /play-video?path=/path/to/video
      if (parsedUrl.pathname === '/play-video') {
        const filePath = parsedUrl.searchParams.get('path');
        if (!filePath) {
          res.writeHead(400);
          res.end('Missing path');
          return;
        }

        if (!/\.(avi|flv|mkv|mov|m4v|webm|mp4)$/i.test(filePath)) {
          res.writeHead(415);
          res.end('Unsupported media type');
          return;
        }

        const downloadHistory = await downloadHistoryOperations.getAllByCompletedAtDesc();
        const allDownloadPaths = downloadHistory?.map((d) => d.download_path);

        if (!allDownloadPaths?.includes(filePath)) {
          res.writeHead(403);
          res.end('Forbidden');
          logger.error(`Forbidden access to ${filePath}`);
          return;
        }

        const fileStat = await statAsync(filePath);
        const range = req.headers.range;
        const mimeType = mime.lookup(filePath) || 'application/octet-stream';

        if (range) {
          const [startStr, endStr] = range.replace(/bytes=/, '').split('-');
          const start = parseInt(startStr, 10);
          const end = endStr ? parseInt(endStr, 10) : fileStat.size - 1;
          const chunkSize = end - start + 1;

          res.writeHead(206, {
            'Content-Range': `bytes ${start}-${end}/${fileStat.size}`,
            'Accept-Ranges': 'bytes',
            'Content-Length': chunkSize,
            'Content-Type': mimeType
          });

          createReadStream(filePath, { start, end }).pipe(res);
          return;
        }

        res.writeHead(200, {
          'Content-Length': fileStat.size,
          'Content-Type': mimeType,
          'Accept-Ranges': 'bytes'
        });

        createReadStream(filePath).pipe(res);
        return;
      }

      if (parsedUrl.pathname === '/embed') {
        const urlToEmbed = parsedUrl.searchParams.get('url');
        const source = parsedUrl.searchParams.get('source') as Source;

        if (!urlToEmbed || !source) {
          res.writeHead(400);
          res.end('Missing url or source');
          return;
        }

        if (source === 'youtube-video') {
          const videoId = new URL(urlToEmbed).searchParams.get('v');
          const embedUrl = `https://www.youtube.com/embed/${videoId}`;
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
