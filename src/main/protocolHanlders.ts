import { protocol } from 'electron';
import { readFile, stat } from 'node:fs/promises';
import mime from 'mime-types';
import { createReadStream } from 'node:fs';

protocol.registerSchemesAsPrivileged([
  {
    scheme: 'playmedia',
    privileges: {
      standard: true,
      secure: true,
      supportFetchAPI: true,
      stream: true,
      corsEnabled: true
    }
  }
]);

async function registerProtocolHandlers() {
  protocol.handle('image', async (req) => {
    const parsedUrl = new URL(req.url);
    const encoded = parsedUrl.pathname.slice(1);
    const filePath = decodeURIComponent(encoded);
    const mimeType = mime.lookup(filePath) || 'application/octet-stream';
    const data = await readFile(filePath);
    return new Response(data, {
      headers: {
        'Content-Type': mimeType
      }
    });
  });

  protocol.handle('playmedia', async (req) => {
    const parsedUrl = new URL(req.url);

    if (parsedUrl.hostname === 'video' || parsedUrl.hostname === 'audio') {
      const filepath = decodeURIComponent(parsedUrl.pathname.slice(1));

      const stats = await stat(filepath);
      const mimeType = mime.lookup(filepath) || 'application/octet-stream';
      const range = req.headers.get('range');

      if (range) {
        const [startStr, endStr] = range.replace(/bytes=/, '').split('-');
        const start = Number(startStr);
        const end = endStr ? Number(endStr) : stats.size - 1;

        const stream = createReadStream(filepath, { start, end });
        // @ts-ignore any
        return new Response(stream, {
          status: 206,
          headers: {
            'Content-Type': mimeType,
            'Content-Length': String(end - start + 1),
            'Content-Range': `bytes ${start}-${end}/${stats.size}`,
            'Accept-Ranges': 'bytes'
          }
        });
      }

      const stream = createReadStream(filepath);

      // @ts-ignore any
      return new Response(stream, {
        status: 200,
        headers: {
          'Content-Type': mimeType,
          'Content-Length': String(stats.size),
          'Accept-Ranges': 'bytes'
        }
      });
    }

    return new Response('Not found', { status: 404 });
  });
}

export default registerProtocolHandlers;
