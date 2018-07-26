const myId = (new MediaStream).id;
console.log(`myId:${myId}`);
const skywayApiKey = '01099bd8-1083-4c33-ba9b-564a1377e901';
const roomName = 'hoge_fuga_piyo_sfu';
const roomMode = 'sfu';

function appendVideo(stream) {
    const video = document.createElement('video');
    video.srcObject = stream;
    document.body.appendChild(video);
    video.play();
}
chrome.runtime.sendMessage('eiceogpklagmibnoccdincfglccflknk', { cap: true }, async streamId => {
    let stream = null;
    try {
        stream = await navigator.mediaDevices.getUserMedia({
            video: {
                mandatory: {
                    chromeMediaSource: 'desktop',
                    chromeMediaSourceId: streamId
                }
            }
        });
        appendVideo(stream);
    } catch (e) {
        console.error(e);
        return;
    }
    console.log(`streamId:${stream.id}`);
    const peer = new Peer(myId, {
        key: skywayApiKey
    });
    peer.on('open', id => {
        myIdDisp.textContent = id;
        const room = peer.joinRoom(roomName, { mode: roomMode, stream, videoBandwidth: 2048 });
        room.on('open', _ => {
            const dummyPeer = new Peer({ key: skywayApiKey });
            dummyPeer.on('open', _ => {
                const dummyRoom = dummyPeer.joinRoom(roomName, { mode: roomMode });
                dummyRoom.on('open', _ => dummyRoom.close());
                dummyRoom.on('close', _ => dummyPeer.destroy());
            });
        room.on('stream', stream => {
            console.log(`room on stream peerId:${stream.peerId}`);
            appendVideo(stream);
        });
    });
});
