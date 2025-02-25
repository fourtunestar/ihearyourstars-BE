import { useState } from "react";
import * as Tone from "tone";

export default function useOrgel() {
    const [melody, setMelody] = useState([]);

    // 🔹 랜덤 오르골 멜로디 생성
    function generateOrgelMelody() {
        const scale = ["C4", "D4", "E4", "F4", "G4", "A4", "B4", "C5"];
        let notes = [];
        for (let i = 0; i < 8; i++) {
            const note = scale[Math.floor(Math.random() * scale.length)];
            notes.push({ time: `0:${i}`, note, duration: "8n" });
        }
        setMelody(notes);
    }

    // 🔹 Tone.js로 멜로디 재생
    async function playMelody() {
        const synth = new Tone.Synth().toDestination();
        melody.forEach(({ time, note, duration }) => {
            Tone.schedule(time => {
                synth.triggerAttackRelease(note, duration, time);
            }, time);
        });
        Tone.start();
    }

    return { melody, generateOrgelMelody, playMelody };
}