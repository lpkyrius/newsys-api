// server functions

const http = require('http');

const app = require('./app');

const PORT = process.env.PORT || 8000;

const server = http.createServer(app);

async function startServer() {
    server.listen(PORT, () => {
        // await function_name();
        console.log(`Listening on PORT ${PORT}...`);
    });
}

startServer();


// server.on('request', (req, res) => {
//     if (req.url === '/'){
//         res.writeHead(200, {
//             'Content-Type': 'application/json',
//         });
//         res.end(JSON.stringify({
//             id: 1,
//             message: 'NewSAVIC is borning!'
//         }));
//     } else if req.method === 'GET'{

//     }
// });

