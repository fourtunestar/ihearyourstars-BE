const RhythmPatterns = {
    aries: ["A", "B", "C", "D", "B", "A"],
    taurus: ["B", "D", "A", "C", "D", "B"],
    gemini: ["C", "A", "B", "D", "A", "C"],
    cancer: ["D", "B", "C", "A", "B", "D"],
};

// 🎵 별자리 기반 리듬 패턴 반환
export function getRhythmPattern(zodiacSign) {
    return RhythmPatterns[zodiacSign] || RhythmPatterns.aries; // 기본값: 양자리
}

// 🎵 리듬 패턴을 노트 길이로 변환
export function convertRhythmPattern(pattern) {
    const NoteDurations = {
        A: ["d4"],  // 점4분음표
        B: ["q", "e"],  // 4분음표 + 8분음표
        C: ["e", "q"],  // 8분음표 + 4분음표
        D: ["e", "e", "e"],  // 8분음표 3개
    };
    return pattern.map((p) => NoteDurations[p] || ["e", "e", "e"]); // 기본값 8분음 3개
}
