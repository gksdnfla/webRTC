const socket = io();
let offerPc = null;

const localVideo = document.getElementById('localVideo');

(async function() {
  const localStream = await navigator.mediaDevices.getDisplayMedia({video: true, audio: false});

  localVideo.srcObject = localStream;

  socket.emit("createClassroom", 'name');

  socket.on("studentJoinedIn", async data => {
    offerPc = new RTCPeerConnection();
  
    offerPc.onicecandidate = e => {
      if (e.candidate) {
        socket.emit("ice", {from: socket.id, to: data.studentSid, ice: e.candidate});
      }
    };

    offerPc.onconnectionstatechange = e => {
      console.log(offerPc.connectionState )
    }

    localStream.getTracks().forEach(t => {
      offerPc.addTrack(t);
    });

    let offer = await offerPc.createOffer();
    socket.emit("teacherOffer", {from: socket.id, to: data.studentSid, offer: offer});
    await offerPc.setLocalDescription(new RTCSessionDescription(offer));
  });

  socket.on("studentAnswer", async data => {
    await offerPc.setRemoteDescription(new RTCSessionDescription(data.answer));
  });

  socket.on("ice", data => {
    offerPc.addIceCandidate(new RTCIceCandidate(data.ice));
  });
})();