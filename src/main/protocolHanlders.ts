import { protocol } from 'electron';
import { readFile } from 'node:fs/promises';
import mime from 'mime-types';

async function registerProtocolHandlers() {
  protocol.handle('media', async (req) => {
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
}

export default registerProtocolHandlers;
