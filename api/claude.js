// Vercel Function: Claude API 프록시
// 브라우저에서 직접 키를 노출하지 않고, 이 함수가 환경변수의 키로 호출합니다.
// Vercel 대시보드 > 프로젝트 > Settings > Environment Variables 에 ANTHROPIC_API_KEY 등록 필요.
// 파일 위치: 프로젝트 폴더 안의  api/claude.js   →  호출 주소는  /api/claude

import Anthropic from '@anthropic-ai/sdk';

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

export default async function handler(req, res) {
  // GET 요청이 아닌 POST 요청만 받도록 제한 (필요에 따라 조절)
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  try {
    // API 키 확인용 안전장치
    if (!process.env.ANTHROPIC_API_KEY) {
      return res.status(500).json({ error: "ANTHROPIC_API_KEY가 설정되지 않았습니다." });
    }

    // Netlify의 event.body 대신 Vercel은 req.body를 사용합니다.
    const { prompt } = req.body; 

    const response = await anthropic.messages.create({
      model: 'claude-3-5-sonnet-20241022',
      max_tokens: 1024,
      messages: [{ role: 'user', content: prompt }],
    });

    // Vercel 응답 방식
    return res.status(200).json(response);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
}
