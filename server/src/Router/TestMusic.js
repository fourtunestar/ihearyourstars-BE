import React, { useState } from "react";
import useOrgel from "../hooks/UseOrgel";
import { saveOrgelMelody, fetchOrgelMelodies } from "../services/SupabaseService";

function Music() {
    const { melody, generateOrgelMelody, playMelody } = useOrgel();
    const [nickname, setNickname] = useState("");
    const [birth, setBirth] = useState("");
    const [starNum, setStarNum] = useState(1);

    // 🔹 저장 버튼 클릭 시 Supabase에 저장
    async function handleSave() {
        await saveOrgelMelody(nickname, birth, starNum, melody);
    }

    // 🔹 Supabase에서 저장된 데이터 불러오기
    async function handleFetch() {
        const data = await fetchOrgelMelodies();
        console.log("Loaded songs:", data);
    }

    return (
        <div>
            <h1>Orgel Music</h1>
            <div>
                <label>Nickname:</label>
                <input type="text" value={nickname} onChange={(e) => setNickname(e.target.value)} />
            </div>
            <div>
                <label>Birth (MMDD):</label>
                <input type="text" value={birth} onChange={(e) => setBirth(e.target.value)} maxLength="4" />
            </div>
            <div>
                <label>Star (1~5):</label>
                <input type="number" value={starNum} onChange={(e) => setStarNum(Number(e.target.value))} min="1" max="5" />
            </div>
            <button onClick={generateOrgelMelody}>Generate Melody</button>
            <button onClick={playMelody}>Play</button>
            <button onClick={handleSave}>Save to Supabase</button>
            <button onClick={handleFetch}>Load from Supabase</button>
        </div>
    );
}

export default Music;
