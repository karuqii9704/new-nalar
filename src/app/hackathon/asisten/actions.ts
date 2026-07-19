"use server";

import { GoogleGenAI } from "@google/genai";
import { answerPrompt, QUICK_PROMPTS } from "@/lib/hackathon/assistant";
import { hydrateLive } from "@/lib/hackathon/store";

export interface AssistantReply {
    text: string;
    csv?: string;
    csvName?: string;
    source: "ai" | "template";
}

export async function askAssistant(promptId: string, localISO?: string): Promise<AssistantReply> {
    await hydrateLive();
    const base = answerPrompt(promptId, localISO);
    const label = QUICK_PROMPTS.find((q) => q.id === promptId)?.label ?? promptId;

    // No grounded facts (unknown prompt) → return guardrail message as-is.
    if (!base.facts) {
        return { text: base.text, source: "template" };
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
        return { text: base.text, csv: base.csv, csvName: base.csvName, source: "template" };
    }

    try {
        const ai = new GoogleGenAI({ apiKey });
        const prompt =
            `Anda adalah asisten AI "NALAR" untuk direktur koperasi dan pemilik gerai IKM. ` +
            `Tulis jawaban eksekutif yang ringkas, tenang, dan profesional dalam Bahasa Indonesia. ` +
            `Jangan terdengar seperti chatbot generik: jelaskan keputusan, alasan, dan langkah berikutnya bila fakta mendukung. ` +
            `WAJIB: gunakan HANYA angka dari FAKTA di bawah — dilarang keras menambah, mengubah, atau mengarang angka apa pun. ` +
            `Jangan menyebut kata "FAKTA". Gunakan poin bila membantu.\n\n` +
            `Pertanyaan direktur: "${label}"\n` +
            `FAKTA (sumber kebenaran, sudah teratestasi SAKSI): ${base.facts}`;
        const res = await ai.models.generateContent({ model: "gemini-flash-latest", contents: prompt });
        const text = (res.text ?? "").trim();
        if (text.length > 20) {
            return { text, csv: base.csv, csvName: base.csvName, source: "ai" };
        }
    } catch {
        // fall through to deterministic template
    }
    return { text: base.text, csv: base.csv, csvName: base.csvName, source: "template" };
}
