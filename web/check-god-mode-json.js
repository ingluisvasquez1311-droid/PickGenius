require('dotenv').config({ path: '.env.local' });
const Groq = require("groq-sdk");
const fs = require('fs');

const raw = process.env.GROQ_API_KEYS || "";
const keys = raw.split(/[,;\s\n]+/).map(k => k.trim()).filter(k => k.startsWith('gsk_'));

if (keys.length === 0) {
    fs.writeFileSync('status_check.json', JSON.stringify({ status: "error", message: "No keys" }));
    process.exit(1);
}

const apiKey = keys[Math.floor(Math.random() * keys.length)];
const groq = new Groq({ apiKey });

async function test() {
    try {
        const completion = await groq.chat.completions.create({
            messages: [{ role: "user", content: "Estado." }],
            model: "llama-3.3-70b-versatile",
        });
        fs.writeFileSync('status_check.json', JSON.stringify({
            status: "success",
            message: completion.choices[0]?.message?.content
        }));
    } catch (error) {
        fs.writeFileSync('status_check.json', JSON.stringify({
            status: "error",
            code: error.status,
            message: error.message
        }));
    }
}

test();
