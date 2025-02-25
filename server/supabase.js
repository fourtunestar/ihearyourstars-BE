import { createClient } from "@supabase/supabase-js";

// 🔹 Supabase 설정 (환경 변수 사용)
const supabase = createClient(
    import.meta.env.VITE_SUPABASE_URL,
    import.meta.env.VITE_SUPABASE_ANON_KEY
);

export { supabase };