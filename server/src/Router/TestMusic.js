import React, { useState } from "react";
import { saveOrgelMelody, fetchSongById } from "../services/SupabaseService";
import { generateOrgelMelody } from "../utils/OrgelMusicGenerator";
import { playMelody } from "../utils/PlayMelody";
import "../TestMusic.css"; // 🎨 애니메이션 스타일 추가

function TestMusic() {
    const [melody, setMelody] = useState([]);
    const [title, setTitle] = useState(""); 
    const [nickname, setNickname] = useState("");
    const [birth, setBirth] = useState("");
    const [starNum, setStarNum] = useState(1);
    const [songId, setSongId] = useState(null);
    const [savedSong, setSavedSong] = useState(null);
    const [notesOnScreen, setNotesOnScreen] = useState([]);
    const [showTitleInput, setShowTitleInput] = useState(false);

    async function handleGenerateMelody() {
        if (!nickname || !birth || starNum < 1 || starNum > 5) {
            alert("이름, 생일, 별 번호를 올바르게 입력하세요!");
            return;
        }

        // 🎼 멜로디 생성
        const newMelody = generateOrgelMelody(nickname, birth, starNum);

        if (!newMelody.length) {
            console.error("❌ Melody generation failed!");
            alert("멜로디를 생성할 수 없습니다. 입력 값을 확인하세요!");
            return;
        }
        
        console.log("✅ Generated Melody:", newMelody);

        // 🎵 자동 저장: 기본 곡 제목 설정 후 Supabase에 저장
        const defaultTitle = `${nickname}의 오르골`;
        setMelody(newMelody);
        setTitle(defaultTitle);
        setShowTitleInput(false);

        // 💾 Supabase에 저장
        console.log("🔹 입력 값:", { nickname, birth, starNum });
        const newSongId = await saveOrgelMelody(nickname, birth, starNum, newMelody, defaultTitle);
        if (newSongId) {
            setSongId(newSongId);
            handleFetch(newSongId);
            alert(`🎵 멜로디가 생성되고 저장되었습니다! Song ID: ${newSongId}`);
        }
    }
    
    function handlePlayMelody() {
        if (melody.length > 0) {
            console.log("🎵 재생할 멜로디 데이터:", melody);
            setNotesOnScreen([]); 
            playMelody(melody, setNotesOnScreen);
        } else {
            alert("먼저 멜로디를 생성하세요!");
        }
    }

    async function handleSaveTitle() {
        if (!title.trim()) {
            alert("곡 제목을 입력하세요!");
            return;
        }
        const newSongId = await saveOrgelMelody(nickname, birth, starNum, melody, title);
        if (newSongId) {
            setSongId(newSongId);
            handleFetch(newSongId);
        }
    }

    async function handleFetch(song_id) {
        const data = await fetchSongById(song_id);
        if (data) {
            setSavedSong(data);
        }
    }

    return (
        <div className="music-container">
            <h1>Orgel Music</h1>
            
            {/* 사용자 입력 */}
            <div className="input-area">
                <label>Nickname:</label>
                <input type="text" value={nickname} onChange={(e) => setNickname(e.target.value)} />
                <label>Birth (MMDD):</label>
                <input type="text" value={birth} onChange={(e) => setBirth(e.target.value)} maxLength="4" />
                <label>Star (1~5):</label>
                <input type="number" value={starNum} onChange={(e) => setStarNum(Number(e.target.value))} min="1" max="5" />
            </div>

            {/* 음악 생성 버튼 (클릭 시 자동 저장됨) */}
            <button onClick={handleGenerateMelody}>Generate & Save</button>

            {/* 음악이 생성되었을 때만 재생 가능 */}
            {melody.length > 0 && <button onClick={handlePlayMelody}>Play</button>}

            {/* 곡 제목 입력란 (음악 재생 후 표시) */}
            {showTitleInput && (
                <div>
                    <label>곡 제목:</label>
                    <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} />
                    <button onClick={handleSaveTitle}>Save to Supabase</button>
                </div>
            )}

            {/* 🎼 음표 애니메이션을 별도의 div로 분리 */}
            <div className="note-area">
                {notesOnScreen.map((note, index) => (
                    <div key={index} className="note" style={{ left: note.x, animationDuration: `${note.duration}s` }}>
                        {note.symbol}
                    </div>
                ))}
            </div>

            {/* 저장된 곡 정보 표시 */}
            {savedSong && (
                <div>
                    <h2>🎶 저장된 곡 정보</h2>
                    <p>🎵 곡 제목: {savedSong.title}</p>
                    <p>👤 닉네임: {savedSong.nickname}</p>
                    <p>🎂 생일 (MMDD): {savedSong.birth}</p>
                    <p>⭐ 별: {savedSong.star_num} / 5</p>
                </div>
            )}
        </div>
    );
}

export default TestMusic;