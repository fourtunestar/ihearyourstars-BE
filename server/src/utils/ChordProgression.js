const ChordProgressions = {
    yellow: ["C-Am", "F-G", "C-Am", "F-G", "Am-F", "C-G", "Am-Dm", "G-C"],
    blue: ["C-F", "C-G", "F-C", "F-G", "C-F", "C-G", "F-C", "G-C"],
    pink: ["Am-F", "C-G", "Am-F", "C-G", "F-Am", "C-G", "F-Am", "G-C"],
    green: ["C-G", "Am-F", "C-Am", "F-G", "C-G", "Am-F", "C-Am", "G-C"],
    purple: ["C-Am", "Dm-G", "C-Am", "Dm-G", "C-Am", "Dm-G", "C-Am", "G-C"],
};

// 🎼 코드 진행 패턴 반환
export function getChordProgression(starNum) {
    const colors = ["yellow", "blue", "pink", "green", "purple"];
    const color = colors[(starNum - 1) % colors.length];
    return ChordProgressions[color] || ChordProgressions.yellow; // 기본값: 노랑
}
