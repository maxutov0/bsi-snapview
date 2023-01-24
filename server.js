const { randomInt } = require('crypto');
const express = require('express');
const http = require('http');
const { Server } = require("socket.io");

const app = express();

const server = http.createServer(app, {
    cors: {
        origin: 'localhost:3000',
    }
});
const io = new Server(server);

const clients = new Map();

const stream = {
    technology: null,
    isStreaming: false,
    isPaused: false,
    isMobile: false,
    screen: null,
    window: null,
    title: null,
    content: null
}

io.on('connection', (socket) => {
    socket.on('disconnect', () => {
        clients.delete(socket.id);
    });

    // if user is not in the map, add him
    if (!clients.has(socket.id)) {
        // if there is no presenter in the map, set the role to presenter
        if (!Array.from(clients.values()).some(client => client.role === 'Presenter')) {
            clients.set(socket.id, { socket, role: 'Presenter' });
        } else {
            clients.set(socket.id, { socket, role: 'Participant' });
        }
    }

    // first bit of information sent to the client
    socket.emit('role', { role: clients.get(socket.id).role });

    // second bit of information sent to the client
    // if client is presenter, send the list of technologies to the client
    if (clients.get(socket.id).role === 'Presenter') {
        socket.emit('technologies', { technologies: ['VNC', 'WebRTC'] });
    }

    // handle start with technology
    socket.on('init', (technology, callback) => {
        stream.technology = technology;
        stream.isMobile = true;
        if (stream.isMobile) {
            stream.title = 'Mobile Display';
        }

        callback({ isConnected: true, isMobile: stream.isMobile })
    })

    socket.on('startStream', (callback) => {
        stream.isStreaming = true;

        clients.forEach(client => {
            client.socket.emit('streamStart', { title: stream.title, content: stream.content, isMobile: stream.isMobile });
        })

        callback()
    })


    setInterval(() => {
        // if technology is VNC and not mobile, regularly send list of screens and windows
        if (stream.technology === "VNC" && !stream.isMobile) {
            socket.emit('screens', { screens: [{ id: 1, title: 'Screen 1' }, { id: 2, title: 'Screen 2' }] });
            socket.emit('windows', { windows: [{ id: 1, title: 'Window 1' }, { id: 2, title: 'Window 2' }] });
        }
    }, 1000);


    // stop 
    socket.on('stop', (callback) => {
        stream.isStreaming = false;
        stream.isMobile = false;
        stream.screen = null;
        stream.window = null;
        stream.title = null;
        stream.technology = null;
        stream.content = null;

        clients.forEach(client => {
            client.socket.emit('streamStop');
        })

        callback()
    })

    // pause
    socket.on('pause', (callback) => {
        stream.isPaused = !stream.isPaused;
        callback()
    })

    socket.on('selectScreen', (id, callback) => {
        stream.screen = id;
        stream.title = 'Screen ' + id;
        stream.isStreaming = true;

        clients.forEach(client => {
            client.socket.emit('streamStart', { title: stream.title, content: stream.content, isMobile: stream.isMobile });
        })

        callback()
    })

    socket.on('selectWindow', (id, callback) => {
        stream.window = id;
        stream.title = 'Window ' + id;
        stream.isStreaming = true;

        clients.forEach(client => {
            client.socket.emit('streamStart', { title: stream.title, content: stream.content, isMobile: stream.isMobile });
        })

        callback()
    })
});

server.listen(4000, () => {
    console.log('listening on localhost:4000');
});