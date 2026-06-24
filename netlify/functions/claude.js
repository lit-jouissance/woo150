// Netlify Function: Claude API 프록시
// 브라우저에서 직접 키를 노출하지 않고, 이 함수가 환경변수의 키로 호출합니다.
// Netlify 대시보드 > Site settings > Environment variables 에 ANTHROPIC_API_KEY 등록 필요.

exports.handler = async (event) => {
  if (event.httpMethod !== "POST") {
    return { statusCode: 405, body: "Method Not Allowed" };
  }
  const key = process.env.ANTHROPIC_API_KEY;
  if (!key) {
    return { statusCode: 500, body: JSON.stringify({ error: "ANTHROPIC_API_KEY가 설정되지 않았습니다." }) };
  }
  try {
    const { messages, system, model, max_tokens } = JSON.parse(event.body || "{}");
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
    return {
      statusCode: r.status,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    };
  } catch (e) {
    return { statusCode: 500, body: JSON.stringify({ error: String(e) }) };
  }
};
