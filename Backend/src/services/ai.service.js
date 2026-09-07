const { GoogleGenAI } = require("@google/genai")
const { z } = require("zod")
const { zodToJsonSchema } = require("zod-to-json-schema")
const puppeteer = require("puppeteer")

function getAiClient() {
    const apiKey = process.env.GOOGLE_GENAI_API_KEY
    if (!apiKey || apiKey === "dummy-key") {
        throw new Error("GOOGLE_GENAI_API_KEY is not set in Backend .env file. Please provide a valid Gemini API Key.")
    }
    return new GoogleGenAI({ apiKey })
}

const interviewReportSchema = z.object({
    matchScore: z.number().describe("A score between 0 and 100 indicating how well the candidate's profile matches the job describe"),
    technicalQuestions: z.array(z.object({
        question: z.string().describe("The technical question can be asked in the interview"),
        intention: z.string().describe("The intention of interviewer behind asking this question"),
        answer: z.string().describe("How to answer this question, what points to cover, what approach to take etc.")
    })).describe("Technical questions that can be asked in the interview along with their intention and how to answer them"),
    behavioralQuestions: z.array(z.object({
        question: z.string().describe("The technical question can be asked in the interview"),
        intention: z.string().describe("The intention of interviewer behind asking this question"),
        answer: z.string().describe("How to answer this question, what points to cover, what approach to take etc.")
    })).describe("Behavioral questions that can be asked in the interview along with their intention and how to answer them"),
    skillGaps: z.array(z.object({
        skill: z.string().describe("The skill which the candidate is lacking"),
        severity: z.enum([ "low", "medium", "high" ]).describe("The severity of this skill gap, i.e. how important is this skill for the job and how much it can impact the candidate's chances")
    })).describe("List of skill gaps in the candidate's profile along with their severity"),
    preparationPlan: z.array(z.object({
        day: z.number().describe("The day number in the preparation plan, starting from 1"),
        focus: z.string().describe("The main focus of this day in the preparation plan, e.g. data structures, system design, mock interviews etc."),
        tasks: z.array(z.string()).describe("List of tasks to be done on this day to follow the preparation plan, e.g. read a specific book or article, solve a set of problems, watch a video etc.")
    })).describe("A day-wise preparation plan for the candidate to follow in order to prepare for the interview effectively"),
    title: z.string().describe("The title of the job for which the interview report is generated"),
})

function parseAiJson(rawText) {
    let clean = (rawText || "").trim()
    if (clean.startsWith("```json")) {
        clean = clean.replace(/^```json\s*/i, "").replace(/\s*```$/, "")
    } else if (clean.startsWith("```")) {
        clean = clean.replace(/^```\s*/, "").replace(/\s*```$/, "")
    }
    return JSON.parse(clean)
}

const AVAILABLE_MODELS = [
    "gemini-3.6-flash",
    "gemini-3-flash-preview"
]

async function generateInterviewReport({ resume, selfDescription, jobDescription }) {

    const prompt = `Generate an interview report for a candidate with the following details:
Resume: ${resume || "Not provided"}
Self Description: ${selfDescription || "Not provided"}
Job Description: ${jobDescription || "Not provided"}
`

    const ai = getAiClient()
    let lastError = null

    for (const model of AVAILABLE_MODELS) {
        try {
            const response = await ai.models.generateContent({
                model,
                contents: prompt,
                config: {
                    responseMimeType: "application/json",
                    responseSchema: zodToJsonSchema(interviewReportSchema),
                }
            })

            return parseAiJson(response.text)
        } catch (err) {
            console.error(`Model ${model} failed for interview report:`, err.message)
            lastError = err
        }
    }

    throw new Error(`Failed to generate interview report with AI: ${lastError?.message || "Unknown error"}`)

}

async function generatePdfFromHtml(htmlContent) {
    const browser = await puppeteer.launch({
        headless: true,
        args: [
            "--no-sandbox",
            "--disable-setuid-sandbox",
            "--disable-dev-shm-usage",
            "--disable-accelerated-2d-canvas",
            "--disable-gpu"
        ]
    })
    const page = await browser.newPage();
    await page.setContent(htmlContent, { waitUntil: "load" })

    const pdfBuffer = await page.pdf({
        format: "A4",
        printBackground: true,
        margin: {
            top: "15mm",
            bottom: "15mm",
            left: "15mm",
            right: "15mm"
        }
    })

    await browser.close()

    return Buffer.from(pdfBuffer)
}

async function generateResumePdf({ resume, selfDescription, jobDescription }) {

    const prompt = `You are an expert ATS resume writer and designer.
Generate a complete, ATS-friendly HTML resume with clean, professional styling using inline CSS and <style> block.
Candidate Details:
Resume: ${resume || "Not provided"}
Self Description: ${selfDescription || "Not provided"}
Target Job Description: ${jobDescription || "Not provided"}

Requirements:
1. Tailor the resume specifically for the target job description, highlighting candidate strengths and relevant experience.
2. Structure the HTML cleanly with standard sections: Header (Name, Contact, Links), Professional Summary, Work Experience, Key Skills, Projects, Education.
3. Keep the styling clean, modern, and professional (dark slate/navy text, subtle accent colors, clean typography) designed to fit 1-2 pages in A4 print format.
4. Output ONLY valid, complete HTML starting with <!DOCTYPE html>. Do not output markdown codeblocks or conversational text.
`

    const ai = getAiClient()
    let lastError = null

    for (const model of AVAILABLE_MODELS) {
        try {
            const response = await ai.models.generateContent({
                model,
                contents: prompt
            })

            let htmlContent = (response.text || "").trim()
            if (htmlContent.startsWith("```html")) {
                htmlContent = htmlContent.replace(/^```html\s*/i, "").replace(/\s*```$/, "")
            } else if (htmlContent.startsWith("```")) {
                htmlContent = htmlContent.replace(/^```\s*/, "").replace(/\s*```$/, "")
            }

            const pdfBuffer = await generatePdfFromHtml(htmlContent)
            return pdfBuffer
        } catch (err) {
            console.error(`Model ${model} failed for resume PDF:`, err.message)
            lastError = err
        }
    }

    throw new Error(`Failed to generate resume PDF with AI: ${lastError?.message || "Unknown error"}`)

}

module.exports = { generateInterviewReport, generateResumePdf }