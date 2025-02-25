import { supabase } from "../supabase";

// 🔹 Supabase에 악보 저장
export async function saveOrgelMelody(nickname, birth, starNum, melody) {
    if (!nickname || !birth || starNum < 1 || starNum > 5) {
        alert("모든 정보를 입력하고 별은 1~5 범위 내에서 선택하세요.");
        return;
    }

    const { error } = await supabase.from("songs").insert([{ 
        nickname, birth, star_num: starNum, notes: melody 
    }]);

    if (error) {
        console.error("Error saving:", error);
        alert("저장 실패!");
    } else {
        alert("악보 저장 완료!");
    }
}

// 🔹 Supabase에서 데이터 조회
export async function fetchOrgelMelodies() {
    const { data, error } = await supabase.from("songs").select("*");
    if (error) {
        console.error("Error fetching:", error);
        return [];
    }
    return data;
}