"use server"
import {
    GoogleGenerativeAI,
} from "@google/generative-ai";
export default async function useGemini(ideasPrompt: string, partyType: string) {
    const apiKey = process.env.GEMINI_API_KEY;
    const genAI = new GoogleGenerativeAI(apiKey!);
    const generationConfig = {
        temperature: 0.7,
        topP: 0.95,
        topK: 64,
        maxOutputTokens: 150,
        responseMimeType: "text/plain",
    };

    const model = genAI.getGenerativeModel({
        generationConfig: generationConfig,
        model: "gemini-1.5-flash",
    });
    const prompt = `Give me top 10 ideas for activities someone can do in a ${partyType} on a theme of ${ideasPrompt} in under 100 words only. Don't ask further questions.`;
    console.log('Prompt:', prompt);
    const result = await model.generateContent(prompt);
    const ideasArray = result.response.text().split("\n").filter((idea) => idea);
    console.log(ideasArray);
    return ideasArray;
}