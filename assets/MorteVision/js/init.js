let javaURI
if (location.hostname === "localhost" || location.hostname === "127.0.0.1") {
        javaURI = "http://localhost:8080";
} else {
    javaURI = "https://spring2025.nighthawkcodingsociety.com";
}
let socket = io(javaURI)
const servers = {
  iceServers: [
      {
          urls:
              [
                  "stun:stun.l.google.com:19302",
                  "stun:stun.l.google.com:5349",
                  "stun:stun1.l.google.com:3478",
                  "stun:stun1.l.google.com:5349",
                  "stun:stun2.l.google.com:19302",
                  "stun:stun2.l.google.com:5349",
                  "stun:stun3.l.google.com:3478",
                  "stun:stun3.l.google.com:5349",
                  "stun:stun4.l.google.com:19302",
                  "stun:stun4.l.google.com:5349"],
      },
  ],
  iceCandidatePoolSize: 10,
}