// Vercel Function: Claude API 프록시
// 브라우저에서 직접 키를 노출하지 않고, 이 함수가 환경변수의 키로 호출합니다.
// Vercel 대시보드 > 프로젝트 > Settings > Environment Variables 에 ANTHROPIC_API_KEY 등록 필요.
// 파일 위치: 프로젝트 폴더 안의  api/claude.js   →  호출 주소는  /api/claude

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method Not Allowed" });
  }
  const key = process.env.ANTHROPIC_API_KEY;
  if (!key) {
    return res.status(500).json({ error: "ANTHROPIC_API_KEY가 설정되지 않았습니다." });
  }
  try {
    // Vercel은 application/json 요청의 body를 자동으로 파싱해줍니다.
    // 혹시 문자열로 들어오는 경우까지 대비해 둘 다 처리합니다.
    const body = typeof req.body === "string" ? JSON.parse(req.body || "{}") : (req.body || {});
    const { messages, system, model, max_tokens } = body;

    const r = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": key,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: model || "claude-haiku-4-5-20251001", // 생성용: 빠르고 저렴
        max_tokens: max_tokens || 1200,
        system,
        messages,
      }),
    });
    const data = await r.json();
    return res.status(r.status).json(data);
  } catch (e) {
    return res.status(500).json({ error: String(e) });
  }
}
