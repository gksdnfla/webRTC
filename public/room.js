const socket = io();

const remoteStream = new MediaStream();

const remoteVideo = document.getElementById('remoteVideo');

let answerPc = null;
let teacherId = null;

remoteVideo.srcObject = remoteStream;

socket.emit("joinClassroom", 'name');

socket.on("teacherOffer", async data => {
    teacherId = data.from;

    answerPc = new RTCPeerConnection();

    answerPc.onicecandidate = e => {
        if(e.candidate)
            socket.emit("ice", {from: socket.id, to: teacherId, ice: e.candidate});
    };

    answerPc.ontrack = e => {
        remoteStream.addTrack(e.track);
    };

    answerPc.onconnectionstatechange = e => {
        console.log(answerPc.connectionState )
      }
  
    await answerPc.setRemoteDescription(new RTCSessionDescription(data.offer));

    let answer = await answerPc.createAnswer();
    await answerPc.setLocalDescription(new RTCSessionDescription(answer));
    socket.emit("studentAnswer", {from: socket.id, to: teacherId, answer: answer});
});

socket.on("ice", data => {
    answerPc.addIceCandidate(new RTCIceCandidate(data.ice));
});
