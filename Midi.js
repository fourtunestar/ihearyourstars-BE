// 1. WebAudio 컨텍스트 생성
const audioContext = new (window.AudioContext || window.webkitAudioContext)();

// 2. SoundFont 로드 (천공 오르골 timbre 사용)
async function loadSoundFont(instrument = 'music_box') {
    const response = await fetch(`https://gleitz.github.io/midi-js-soundfonts/FluidR3_GM/${instrument}-mp3.js`);
    const script = await response.text();
    eval(script); // SoundFont 데이터를 실행하여 사용할 수 있도록 설정
}

// 3. MIDI 노트를 주파수로 변환 (필요시)
function midiToFrequency(midiNote) {
    return 440 * Math.pow(2, (midiNote - 69) / 12);
}

// 4. 별 색상에 따른 화성 진행 패턴 (8마디, 각 마디에 [화성1, 화성2])
const chordProgressions = {
    betelgeuse: [['C', 'Am'], ['F', 'G7'], ['Em', 'Am'], ['Dm', 'G7'], ['Am', 'F'], ['C', 'G7'], ['Em', 'Dm7'], ['G7', 'C']],
    polaris: [['A', 'F#m'], ['D', 'E7'], ['C#m', 'F#m'], ['Bm', 'E7'], ['F#m', 'D'], ['A', 'E7'], ['C#m', 'Bm7'], ['E7', 'A']],
    vega: [['F', 'Dm'], ['Bb', 'C7'], ['Am', 'Dm'], ['Gm', 'C7'], ['Dm', 'Bb'], ['F', 'C7'], ['Am', 'Gm7'], ['C7', 'F']],
    sirius: [['F#m', 'D'], ['Bm', 'C#7'], ['C#m', 'F#m'], ['G#m7♭5', 'C#7'], ['D', 'Bm'], ['F#m', 'C#7'], ['C#m', 'G#m7♭5'], ['C#7', 'F#m']],
    altair: [['Em', 'C'], ['Am', 'B7'], ['Bm', 'Em'], ['F#m7♭5', 'B7'], ['C', 'Am'], ['Em', 'B7'], ['Bm', 'F#m7♭5'], ['B7', 'Em']]
};

// 5. 별자리별 리듬 패턴 (8마디; 각 마디에 A, B, C, D 패턴)
const rhythmPatterns = {
    aries: ['A', 'C', 'B', 'D', 'A', 'B', 'C', 'D'],
    taurus: ['B', 'D', 'A', 'C', 'B', 'A', 'D', 'C'],
    gemini: ['C', 'A', 'D', 'B', 'C', 'D', 'A', 'B'],
    cancer: ['D', 'B', 'C', 'A', 'D', 'A', 'C', 'B'],
    leo: ['A', 'B', 'D', 'C', 'A', 'D', 'C', 'B'],
    virgo: ['C', 'D', 'A', 'B', 'D', 'A', 'C', 'B'],
    libra: ['B', 'A', 'C', 'D', 'B', 'C', 'A', 'D'],
    scorpio: ['D', 'C', 'B', 'A', 'D', 'A', 'C', 'B'],
    sagittarius: ['A', 'B', 'C', 'D', 'A', 'C', 'D', 'B'],
    capricorn: ['C', 'D', 'B', 'A', 'C', 'A', 'B', 'D'],
    aquarius: ['D', 'C', 'A', 'B', 'D', 'A', 'C', 'B'],
    pisces: ['B', 'A', 'D', 'C', 'B', 'C', 'D', 'A']
};

//
// Helper 함수들
//

// 한글 초성 인덱스 추출 (가나다 순서상의 index)
function getChoseong(char) {
    const code = char.charCodeAt(0) - 0xAC00;
    if (code < 0 || code > 11171) return null; // 한글 음절이 아니면 null
    return Math.floor(code / (21 * 28));
}

// TODO: 1, 3, 5 중 2개 조합을 반환
// 한국어 닉네임에서 첫 글자와 마지막 글자를 이용해 두 개의 숫자(3 또는 5)를 반환
function convertNicknameToNumbers(nickname) {
    if (nickname.length < 2) throw new Error("닉네임은 최소 2자 이상이어야 합니다.");
    // 최대 6자로 제한 (필요시 추가 검증 가능)
    const first = nickname[0];
    const last = nickname[nickname.length - 1];
    const cho1 = getChoseong(first);
    const cho2 = getChoseong(last);
    // 초성 인덱스 mod 4 값에 따라: 0,1 → 3, 2,3 → 5
    let num1 = (cho1 % 4) < 2 ? 3 : 5;
    let num2 = (cho2 % 4) < 2 ? 3 : 5;
    // 두 숫자가 같으면 두 번째는 반대값으로 조정
    if (num1 === num2) {
        num2 = num1 === 3 ? 5 : 3;
    }
    return [num1, num2];
}

// TODO: 두 음을 선택, 꼭 3/5가 아님
// 화성 문자열에서 루트 음 추출 후, 해당 화성의 3도와 5도(삼화음의 두 음)를 반환
// 코드의 음을 2개를 택하는 메서드
function getChordTones(chord) {
    const match = chord.match(/^[A-G][#b]?/);
    if (!match) return { third: chord, fifth: chord };
    const root = match[0];
    // 단순 판단: chord 문자열에 'm'가 포함되어 있으면 minor로 처리 (단, 'maj' 제외)
    const isMinor = chord.includes('m') && !chord.toLowerCase().includes('maj');
    const chromatic = ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"];
    let rootIndex = chromatic.indexOf(root);
    if (rootIndex === -1) rootIndex = 0;
    const thirdInterval = isMinor ? 3 : 4;
    const fifthInterval = 7;
    const thirdNote = chromatic[(rootIndex + thirdInterval) % 12];
    const fifthNote = chromatic[(rootIndex + fifthInterval) % 12];
    return { third: thirdNote, fifth: fifthNote };
}

// 두 음 사이의 보강(패싱) 음 추출 (간단히 tone1에서 한 반음 올라간 음을 사용)
function getPassingTone(tone1, tone2) {
    const chromatic = ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"];
    const index1 = chromatic.indexOf(tone1);
    const index2 = chromatic.indexOf(tone2);
    if (index1 === -1 || index2 === -1) return tone1;
    // 기본적으로 tone1 다음 음을 보강음으로 사용 (실제 음정 관계에 따라 조정 가능)
    const passingIndex = (index1 + 1) % 12;
    return chromatic[passingIndex];
}

//
// 최종 멜로디 생성: 각 마디별로 닉네임에서 얻은 숫자와 리듬 패턴에 따라 음 확장
//
function generateFinalMelody(nickname, starName, constellation) {
    // 닉네임에서 두 숫자 추출 (예: [3, 5]) — 현재 이 값은 음 확장 시 직접 사용하지 않고, 각 그룹에서 기본적으로 3도/5도 음을 사용
    const [num1, num2] = convertNicknameToNumbers(nickname);
    // 코드 선택됨
    const chords = chordProgressions[starName] || chordProgressions['betelgeuse'];
    const rhythmPattern = rhythmPatterns[constellation] || rhythmPatterns['aries'];
    let finalMelody = []; // 최종 음표 시퀀스 (노트 이름 배열)

    // 각 마디별로 처리 (총 8마디)
    for (let i = 0; i < chords.length; i++) {
        const measureChords = chords[i]; // [chord1, chord2]
        // 각 화성에서 기본적으로 3도와 5도 추출 (항상 오름차순으로: 예, C: {third:"E", fifth:"G"})
        const tones1 = getChordTones(measureChords[0]);
        // 기본 그룹별 음은 [3도, 5도]
        // chordProgressions
        let baseGroup1 = [tones1.third, tones1.fifth];
        
        const tones2 = getChordTones(measureChords[1]);
        let baseGroup2 = [tones2.third, tones2.fifth];

        // 해당 마디의 리듬 패턴에 따라 각 그룹의 음표 수 결정
        const pat = rhythmPattern[i]; // 한 마디에 적용되는 패턴 (A, B, C, D)
        let group1Notes = [];
        let group2Notes = [];
        if (pat === 'A') {
            // 패턴 A: 그룹당 1음 → 기본 그룹의 첫 음만 사용
            group1Notes = [baseGroup1[0]];
            group2Notes = [baseGroup2[0]];
        } else if (pat === 'B' || pat === 'C') {
            // 패턴 B, C: 그룹당 2음 → 기본 그룹 [3도, 5도] 그대로 사용
            group1Notes = baseGroup1;
            group2Notes = baseGroup2;
        } else if (pat === 'D') {
            // 패턴 D: 그룹당 3음 → [첫 음, 보강음, 두 번째 음]
            group1Notes = [baseGroup1[0], getPassingTone(baseGroup1[0], baseGroup1[1]), baseGroup1[1]];
            group2Notes = [baseGroup2[0], getPassingTone(baseGroup2[0], baseGroup2[1]), baseGroup2[1]];
        } else {
            // 기본은 B/C와 동일
            group1Notes = baseGroup1;
            group2Notes = baseGroup2;
        }
        // 한 마디의 최종 음표: 두 그룹을 순서대로 이어붙임
        finalMelody.push(...group1Notes, ...group2Notes);
    }
    return finalMelody;
}

//
// 리듬 패턴에 맞게 최종 멜로디를 재생하는 함수
//
async function playMelody(melody) {
    await loadSoundFont();
    
    melody.forEach((note, index) => {
        const player = new Audio();
        player.src = `https://gleitz.github.io/midi-js-soundfonts/FluidR3_GM/music_box-mp3/${note}4.mp3`;
        
        // 간단히 각 음마다 0.5초 간격 재생 (리듬 패턴에 따라 음 개수 달라짐)
        let delay = index * 0.5;
        setTimeout(() => player.play(), delay * 1000);
    });
}

//
// 사용자 입력을 받아 최종 멜로디를 생성하고 재생하는 함수
//
function handleUserInput(nickname, starName, constellation) {
    console.log(`사용자 입력 - 닉네임: ${nickname}, 별: ${starName}, 별자리: ${constellation}`);
    const melody = generateFinalMelody(nickname, starName, constellation);
    playMelody(melody);
}``

// 9. AudioContext 활성화를 위한 클릭 이벤트 리스너
document.addEventListener("click", () => {
    if (audioContext.state === "suspended") {
        audioContext.resume().then(() => console.log("🔊 AudioContext 활성화됨"));
    }
});