import http from 'http';
import ErrnoException = NodeJS.ErrnoException;
import app from './app';
import * as yargs from 'yargs';

const argv = yargs
  .usage('Usage: $0 -port [num]')
  .demandOption(['port'])
  .argv;

const PORT = argv.port;
const server = http.createServer(app);

/**
 * Event listener for HTTP server "error" event.
 */
function onError(error: ErrnoException) {
  if (error.syscall !== 'listen') {
    throw error;
  }

  // handle specific listen errors with friendly messages
  switch (error.code) {
    case 'EACCES':
      console.error(`Port ${PORT} requires elevated privileges`);
      process.exit(1);
      break;
    case 'EADDRINUSE':
      console.error(`Port ${PORT} is already in use`);
      process.exit(1);
      break;
    default:
      throw error;
  }
}

server.listen(PORT, () => {
  console.info('Listening on %d', PORT);
});
server.on('error', onError);
