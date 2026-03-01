const BASE_URL = 'http://localhost:8000';

export async function sendChatMessage(question, sessionId = null) {
    const res = await fetch(`${BASE_URL}/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ question, session_id: sessionId }),
    });
    if (!res.ok) throw new Error(`Chat failed: ${res.statusText}`);
    return res.json();
}

export async function uploadPDF(file) {
    const form = new FormData();
    form.append('file', file);
    const res = await fetch(`${BASE_URL}/ingest`, { method: 'POST', body: form });
    if (!res.ok) throw new Error(`Ingest failed: ${res.statusText}`);
    return res.json();
}

export async function startQuiz(subject, unit) {
    const res = await fetch(`${BASE_URL}/quiz/start`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ subject, unit }),
    });
    if (!res.ok) throw new Error(`Quiz start failed: ${res.statusText}`);
    return res.json();
}

export async function submitAnswer(sessionId, difficulty, questionId, answer) {
    const res = await fetch(`${BASE_URL}/quiz/answer`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            session_id: sessionId,
            difficulty,
            question_id: questionId,
            answer,
        }),
    });
    if (!res.ok) throw new Error(`Answer submit failed: ${res.statusText}`);
    return res.json();
}

export async function getQuizResult(sessionId) {
    const res = await fetch(`${BASE_URL}/quiz/result/${sessionId}`);
    if (!res.ok) throw new Error(`Result fetch failed: ${res.statusText}`);
    return res.json();
}

export async function fetchMaterials() {
    const res = await fetch(`${BASE_URL}/materials`);
    if (!res.ok) throw new Error(`Materials fetch failed: ${res.statusText}`);
    return res.json();
}
