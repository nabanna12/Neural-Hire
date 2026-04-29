import OpenAI from 'openai';
import { fallbackQuestions } from '../utils/fallbackQuestions.js';

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export const generateQuestions = async (role, type, difficulty, count) => {
  try {
    const prompt = `Generate exactly ${count} ${difficulty} difficulty ${type} interview questions for a ${role} position. 
Return ONLY a JSON array of question strings, no extra text. Example: ["Question 1?", "Question 2?"]`;

    const response = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [
        { role: 'system', content: 'You are an expert technical interviewer. Return only valid JSON arrays.' },
        { role: 'user', content: prompt },
      ],
      temperature: 0.8,
      response_format: { type: 'json_object' },
    });

    const content = response.choices[0].message.content;
    const parsed = JSON.parse(content);
    const questions = parsed.questions || Object.values(parsed)[0];
    return Array.isArray(questions) ? questions.slice(0, count) : getFallback(role, type, count);
  } catch (err) {
    console.error('OpenAI question gen error:', err.message);
    return getFallback(role, type, count);
  }
};

export const evaluateAnswer = async (question, answer, role, type) => {
  try {
    const prompt = `You are an expert interview coach. Evaluate this answer.

Role: ${role}
Type: ${type}
Question: "${question}"
Answer: "${answer}"

Return ONLY valid JSON in this exact format:
{
  "overallScore": <0-100 integer>,
  "scores": {
    "clarity": <0-100>,
    "relevance": <0-100>,
    "structure": <0-100>,
    "confidence": <0-100>,
    "technical_depth": <0-100>
  },
  "strengths": ["point 1", "point 2", "point 3"],
  "improvements": ["point 1", "point 2", "point 3"],
  "ideal_answer_summary": "2-3 sentence ideal answer",
  "keywords_missing": ["keyword1", "keyword2"],
  "tone": "Confident" | "Nervous" | "Professional",
  "follow_up_question": "A follow-up question"
}`;

    const response = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [
        { role: 'system', content: 'You are an expert interview evaluator. Return only valid JSON.' },
        { role: 'user', content: prompt },
      ],
      temperature: 0.6,
      response_format: { type: 'json_object' },
    });

    return JSON.parse(response.choices[0].message.content);
  } catch (err) {
    console.error('OpenAI evaluation error:', err.message);
    return getFallbackFeedback(answer);
  }
};

const getFallback = (role, type, count) => {
  const pool = fallbackQuestions[type] || fallbackQuestions.Mixed;
  return pool.slice(0, count);
};

const getFallbackFeedback = (answer) => {
  const len = answer?.length || 0;
  const base = Math.min(50 + Math.floor(len / 10), 80);
  return {
    overallScore: base,
    scores: {
      clarity: base,
      relevance: base - 5,
      structure: base - 3,
      confidence: base + 2,
      technical_depth: base - 8,
    },
    strengths: ['Provided an answer', 'Engaged with the question'],
    improvements: ['Add more specific examples', 'Use the STAR method', 'Quantify achievements'],
    ideal_answer_summary: 'A strong answer would include a specific situation, your action, and measurable results.',
    keywords_missing: ['example', 'result', 'impact'],
    tone: 'Professional',
    follow_up_question: 'Can you elaborate with a specific example?',
  };
};