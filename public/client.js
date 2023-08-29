const socket = io();

const iceConfig = { iceServers: [{ urls: 'stun:stun.l.google.com:19302' }] };

socket.emit('createRoom');

(async function init() {
    const localStream = await navigator.mediaDevices.getDisplayMedia({ video: true, audio: true });
    const localVideo = document.querySelector('#localVideo');
    let localPc = null;

    localVideo.srcObject = localStream;

    socket.on('joinedRoom', async data => {
        localPc = new RTCPeerConnection(iceConfig);
        
        localPc.onicecandidate = e => {
            if(e.candidate) {
                socket.emit('transferIce', { from: socket.id, to: data.viewerId, ice: e.candidate })
            }
        }

        localStream.getTracks().forEach(t => {
            localPc.addTrack(t, localStream);
        });

        const offer = await localPc.createOffer();
        await localPc.setLocalDescription(offer);
        socket.emit('transferOffer', { from: socket.id, to: data.viewerId, offer });

    });

    socket.on('receiveAnswer', (data) => {
        localPc.setRemoteDescription(data.answer);
    });

    socket.on('receiveIce', (data) => {
        localPc.addIceCandidate(new RTCIceCandidate(data.ice));
    });
})();
