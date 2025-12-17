import http from 'http';
import repoApp from './app';


const PORT = process.env.PORT || 3000;


const app = repoApp();


const server = http.createServer(app);


server.listen(PORT, () => {
console.log(`Server listening on port ${PORT}`);
});