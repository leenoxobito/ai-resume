require('dotenv').config();

const analyseResume = async ( resumeText, pastResumes = []) => {
    if (!process.env.OPENROUTER_API_KEY) {
        throw new Error(' OPENROUTER_API_KEY is missing from your .env file');
    }

    if (resumeText.trim().length < 50) {
        throw new Error('Resume is too short to analyse. Please paste the full resume text.');
    }
    
    const comparisonContext = 
        pastResumes.length > 0
        ? `For benchmarking, here are ${pastResumes.length} previously analysed resumes:\n\n` +
            pastResumes.map((r, i) => `--Resume ${i + 1} ---\n${r.resume_text}`).join('\n\n')
        : 'No past resumes available for comparison yet.';

    const prompt = `
    You are an expert resume reviewer and career coach with deep knowledge of industry hiring standards.
    
    Analyse the following resume and provide structured feedback using these exact heading:
    1. Overrall Score - Rate out of 10 and explain why.
    2. Strenghts - What is already good and industry standard.
    3. Weaknesses - What is mmissing, unclear, or below standard.
    4. Specific Improvements = Exact changes to make, section by section.
    5. Industry Benchmark - How it compares to industry standards and past resumes.
    6. Top 3 Priority Actions - The 3 most important things to fix first.
    
    ${comparisonContext}
    
    Resume to analyse:
    ---
    ${resumeText}
    ---
    
    Respond in clear, readable plain text. Use the section heading exactly as listed above.
    `
        const reponse = await fetch('https://openrouter.ai/api/v1/chat/completions', {
            method: "POST",
            headers: { 
                'Authorization' : `Bearer ${process.env.OPENROUTER_API_KEY}`,
                'Content-Type' : 'application/json',
                'HTTP-Referer' : 'http://localhost:3000',
                'X-Title' : 'Resume Analyser', 
            },
            body: JSON.stringify ({
                model: process.env.AI_MODEL || 'mistralai/mistral-7b-instruct:free',
                messages: [
                    { role: 'user', content: prompt}
                ],
                max_tokens: 1024,
            }),
        });

        if (!response.ok){
            const err = await response.json().catch(() => ({}));
            if(response.status === 401) throw new Error('Invalid OpenRouter API key. Check your .env file.');      
            if (response.status === 429) throw new Error ('Rate limit hit. Wait a moment and try again.');
            throw new Error(err.error?.message || `OpenRouter error ${response.status}`);
        }

        const data = await response.json();
        const text = data.choices?.[0]?.message?.content;

        if (!text) throw new Error('AI returned an empty response. Please try again.');

        return text;
};

module.exports = {analyseResume};