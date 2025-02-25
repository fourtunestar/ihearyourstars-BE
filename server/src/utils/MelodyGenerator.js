const NoteMapping = ["C", "D", "E", "F", "G", "A", "B"];

// 🎼 닉네임을 기반으로 멜로디 음 리스트 생성
export function getMelodyFromNickname(nickname) {
    let melody = [];
    for (let i = 0; i < nickname.length; i++) {
        const charCode = nickname.charCodeAt(i);
        const noteIndex = (charCode % NoteMapping.length);
        melody.push(NoteMapping[noteIndex] + "4"); // C4~B4 범위
    }
    return melody;
}
