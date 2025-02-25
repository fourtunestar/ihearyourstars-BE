import * as Tone from "tone";

// 🎼 랜덤 오르골 멜로디 생성
export function generateOrgelMelody() {
    const scale = ["C4", "D4", "E4", "F4", "G4", "A4", "B4", "C5"];
    let notes = [];
    for (let i = 0; i < 8; i++) {
        const note = scale[Math.floor(Math.random() * scale.length)];
        notes.push({ time: `0:${i}`, note, duration: "8n" });
    }
    return notes;
}

// 🎵 Tone.js로 멜로디 재생 (UI 차단 문제 해결)
export async function playMelody(melody, setNotesOnScreen) {
    if (!melody || melody.length === 0) {
        alert("재생할 멜로디가 없습니다!");
        return;
    }

    // 🔹 Tone.js Transport 초기화 및 오디오 컨텍스트 활성화
    await Tone.start(); // 🚀 브라우저가 오디오 실행을 막지 않도록 보장
    Tone.Transport.stop();
    Tone.Transport.cancel();
    Tone.context.resume(); // 🚀 UI 이벤트 차단 방지

    const synth = new Tone.Synth().toDestination();
    setNotesOnScreen([]); // 기존 음표 초기화

    melody.forEach(({ time, note, duration }) => {
        Tone.Transport.schedule((t) => {
            synth.triggerAttackRelease(note, duration, t);

            // 🔹 음표 화면에 표시
            const noteSymbol = "♪";
            const xPosition = Math.random() * 80 + 10; // 10%~90% 범위에서 랜덤 위치
            const durationInSec = 2; // 2초 동안 올라가게 설정

            setNotesOnScreen((prevNotes) => [
                ...prevNotes,
                { symbol: noteSymbol, x: `${xPosition}%`, duration: durationInSec },
            ]);
        }, time);
    });

    Tone.Transport.start();
}