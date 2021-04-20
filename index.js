const client = AgoraRTC.createClient({ mode: "live", codec: "vp8" });
const MAX_VIDEOS = 100;

var rtc = {
    // Variables del cliente local.
    client: null,
    localAudioTrack: null,
    localVideoTrack: null,
};

var options = {
    appId: "23284f5bceda4eea97300faa1bdee114",
    channel: "4",  // TODO: preguntar antes de entrar en llamada
    token: null, // Si se quiere usar la comunicacion cifrada hay que pasar un token.
};

startBasicCall();

async function startBasicCall() {
    rtc.client = AgoraRTC.createClient({ mode: "rtc", codec: "vp8" }); // mode live si queremos 1 ponente a muchos espectadores. Codec puede ser "h264".
    rtc.client.on("user-published", async (user, mediaType) => {
        // Subscribe to a remote user.
        await rtc.client.subscribe(user, mediaType);
        console.log("subscribe success");

        console.log(mediaType);

        if (mediaType === "video") {
            const remoteVideoTrack = user.videoTrack;
            const playerContainer = createVideoDOMObject(user);

            remoteVideoTrack.play(playerContainer); // El SDK automaticamente crea un reproductor de video en el div que le pases.
        }

        if (mediaType === "audio") {
            const remoteAudioTrack = user.audioTrack;
            remoteAudioTrack.play();
        }
    });
    rtc.client.on("user-unpublished", user => {
        // Get the dynamically created DIV container.
        const playerContainer = document.getElementById(user.uid);
        // Destroy the container.
        playerContainer.remove();
    });

    const uid = await rtc.client.join(options.appId, options.channel, options.token, null); // pasamos null como parametro uid para que agora genere uno y lo devuelva.

    // ---- Enable audio ----
    rtc.localAudioTrack = await AgoraRTC.createMicrophoneAudioTrack();
    await rtc.client.publish(rtc.localAudioTrack);

    let pushButton = document.getElementById("talkbutton");
    pushButton.style = "";
    pushButton.addEventListener("mousedown", startTalking);
    pushButton.addEventListener("mouseup", stopTalking);
    rtc.localAudioTrack.setVolume(0);
    console.log("audio publish success!");

    // ---- Enable video ----
    if (document.getElementById("videos").childElementCount < MAX_VIDEOS) {
        rtc.localVideoTrack = await AgoraRTC.createCameraVideoTrack({ encoderConfig: "180p_4" });

        const playerContainer = createVideoDOMObject(rtc.client);

        rtc.localVideoTrack.play(playerContainer); // El SDK automaticamente crea un reproductor de video en el div que le pases.
    }
    await rtc.client.publish(rtc.localVideoTrack);

    console.log("video publish success!");
}

async function leaveCall() {
    rtc.localAudioTrack.close();
    if (rtc.localVideoTrack) rtc.localVideoTrack.close();

    rtc.client.remoteUsers.forEach(user => {
        const playerContainer = document.getElementById(user.uid);
        playerContainer && playerContainer.remove();
    });
    const localPlayerContainer = document.getElementById(rtc.client.uid);
    localPlayerContainer && localPlayerContainer.remove();


    await rtc.client.leave(); // Leave the channel.
}

function createVideoDOMObject(user) {
    const playerContainer = document.createElement("div");  // TODO: ver si se puede usar un tag más semántico como <video>

    playerContainer.id = user.uid.toString();
    playerContainer.style.width = "240px";
    playerContainer.style.height = "180px";
    document.getElementById("videos").append(playerContainer);
    return playerContainer;
}

function startTalking() {
    rtc.localAudioTrack.setVolume(100);
    console.log("startTalking()");
}

function stopTalking() {
    rtc.localAudioTrack.setVolume(0);
    console.log("stopTalking()");
}