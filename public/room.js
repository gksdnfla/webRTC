const socket = io();

const iceConfig = { iceServers: [{ urls: 'stun:stun.l.google.com:19302' }] };

const remotePc = new RTCPeerConnection(iceConfig);
const remoteVideo = document.querySelector('#remoteVideo');

socket.emit('joinRoom');

socket.on('receiveOffer', async (data) => {
    remotePc.onicecandidate = (e) => {
        if(e.candidate) {
            socket.emit('transferIce', { from: socket.id, to: data.from, ice: e.candidate });
        }
    }

    remotePc.ontrack = t => {
        const stream = t.streams[0];
        remoteVideo.srcObject = stream;
    }

    await remotePc.setRemoteDescription(data.offer);

    const answer = await remotePc.createAnswer();
    await remotePc.setLocalDescription(answer);
    socket.emit('transferAnswer', { from: socket.id, to: data.from, answer });
});

socket.on('receiveIce', data => {
    remotePc.addIceCandidate(new RTCIceCandidate(data.ice));
});