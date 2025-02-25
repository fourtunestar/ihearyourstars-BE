import * as Tone from "tone";

let lastX = 0;
let lastY = 0;
let lastTime = Date.now();
let bpm = 100; // 기본 BPM
let isPlaying = false;
let currentMelody = [];
let setNotesOnScreenRef = null;
let currentPlaybackTime = 0; // 🔹 현재 재생 위치 저장

// 🎵 마우스 속도 감지 및 BPM 조절
function updateBPM(event) {
    if (!isPlaying) return;

    const now = Date.now();
    const deltaTime = now - lastTime;

    if (deltaTime > 0) {
        const dx = event.clientX - lastX;
        const dy = event.clientY - lastY;
        const distance = Math.sqrt(dx * dx + dy * dy);

        bpm = Math.min(150, Math.max(70, (distance / deltaTime) * 500));
        Tone.Transport.bpm.value = bpm;

        console.log(`🎵 Updated BPM: ${Math.round(bpm)}, Resuming from: ${currentPlaybackTime}`);

        // 🎶 기존 재생 위치부터 다시 재생
        if (currentMelody.length > 0) {
            restartMelodyWithNewBPM();
        }
    }

    lastX = event.clientX;
    lastY = event.clientY;
    lastTime = now;
}

// 🎵 새로운 BPM에 맞게 기존 위치에서 다시 재생
function restartMelodyWithNewBPM() {
    if (!isPlaying) return;

    console.log("🔄 Restarting melody from previous position:", currentPlaybackTime);
    Tone.Transport.stop();
    Tone.Transport.cancel();

    playMelody(currentMelody, setNotesOnScreenRef, currentPlaybackTime);
}

// 마우스 이벤트 리스너 등록
window.addEventListener("mousemove", updateBPM);

// 🎶 멜로디 재생 함수 (현재 위치부터 재생 가능)
export async function playMelody(melody, setNotesOnScreen, startTime = 0) {
    if (!melody || melody.length === 0) {
        alert("재생할 멜로디가 없습니다!");
        return;
    }

    isPlaying = true;
    currentMelody = melody;
    setNotesOnScreenRef = setNotesOnScreen;
    currentPlaybackTime = startTime; // 🔹 재생 위치 초기화

    await Tone.start();
    Tone.Transport.stop();
    Tone.Transport.cancel();
    Tone.context.resume();

    const synth = new Tone.Synth({
        oscillator: { type: "sine" },
        envelope: { attack: 0.01, decay: 0.1, sustain: 0.2, release: 0.3 }
    }).toDestination();

    setNotesOnScreen([]);

    let index = Math.floor((startTime / Tone.Time("8n").toSeconds()) * (bpm / 100)); // 🔹 시작할 인덱스 계산
    let currentTime = Tone.now();

    function playNextNote(time) {
        if (index >= melody.length) {
            Tone.Transport.stop();
            isPlaying = false;
            setNotesOnScreen([]); 
            console.log("🔴 Melody playback completed.");
            return;
        }

        const { note, duration } = melody[index];
        const durationInSeconds = Tone.Time(duration).toSeconds() * (100 / bpm);

        console.log(`🎵 Playing note: ${note}, Duration: ${duration}, Start Time: ${time}, BPM: ${bpm}`);

        synth.triggerAttackRelease(note, duration, time);

        // 🎼 현재 노트 하나만 애니메이션 추가
        Tone.Draw.schedule(() => {
            setNotesOnScreen([{ symbol: "♪", x: `${Math.random() * 80 + 10}%`, duration: 2 }]);
        }, time);

        index++;
        currentPlaybackTime = index * durationInSeconds; // 🔹 현재 위치 업데이트
        currentTime += durationInSeconds;

        Tone.Transport.scheduleOnce(playNextNote, currentTime);
    }

    // 🔹 기존 재생 위치에서 이어서 재생
    Tone.Transport.scheduleOnce(playNextNote, currentTime);
    Tone.Transport.start();
}
