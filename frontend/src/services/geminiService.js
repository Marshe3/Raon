export const getResumeFeedback = async (coverLetter, resumeData) => {
  try {
    // 백엔드 API 호출
    const response = await fetch('/raon/api/gemini/feedback', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        coverLetter,
        name: resumeData.name,
        desiredPosition: resumeData.desiredPosition,
        skills: resumeData.skills,
        schoolName: resumeData.schoolName,
        major: resumeData.major,
        companyName: resumeData.companyName,
        position: resumeData.position
      })
    });

    if (!response.ok) {
      console.error('HTTP 오류:', response.status, response.statusText);
      const errorData = await response.json();
      console.error('오류 데이터:', errorData);
      throw new Error(JSON.stringify(errorData));
    }

    const data = await response.json();
    console.log('백엔드 응답 데이터:', data);
    const text = data.text || '';
    console.log('추출한 text:', text);

    // JSON 파싱 시도
    try {
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0]);
      }
    } catch (e) {
      console.warn('JSON 파싱 실패, 텍스트 형식으로 반환:', e);
    }

    // JSON 파싱 실패시 텍스트 그대로 반환
    return {
      overallScore: 0,
      sections: [{
        title: "AI 피드백",
        score: 0,
        strengths: [],
        improvements: [],
        suggestions: text
      }],
      summary: text,
      recommendedScore: 0
    };

  } catch (error) {
    console.error('Gemini API 호출 오류:', error);
    throw new Error('AI 첨삭 요청 중 오류가 발생했습니다: ' + (error.message || JSON.stringify(error)));
  }
};
