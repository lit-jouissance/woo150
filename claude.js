import Anthropic from '@anthropic-ai/sdk';

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  try {
    if (!process.env.ANTHROPIC_API_KEY) {
      return res.status(500).json({ error: "ANTHROPIC_API_KEY가 설정되지 않았습니다." });
    }

    // [수정 포인트] 프론트엔드 환경에 따라 req.body가 문자열로 들어오는 경우를 대비한 안전장치
    let bodyData = req.body;
    if (typeof bodyData === 'string') {
      try {
        bodyData = JSON.parse(bodyData);
      } catch (e) {
        return res.status(400).json({ error: 'Invalid JSON format in request body' });
      }
    }

    const { prompt } = bodyData; 

    if (!prompt) {
      return res.status(400).json({ error: 'Prompt가 누락되었습니다.' });
    }

    const response = await anthropic.messages.create({
      model: 'claude-3-5-sonnet-20241022',
      max_tokens: 1024,
      messages: [{ role: 'user', content: prompt }],
    });

    return res.status(200).json(response);
  } catch (error) {
    // Vercel 함수 로그에서 실제 에러 원인을 파악할 수 있도록 콘솔 기록 추가
    console.error("Claude API Error:", error);
    return res.status(500).json({ error: error.message });
  }
}
