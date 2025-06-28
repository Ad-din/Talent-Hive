import { db } from "../prisma";
import { inngest } from "./client";

 import { GoogleGenerativeAI } from "@google/generative-ai";

const apiKey = process.env.GEMINI_API_KEY;
if (!apiKey) {
  throw new Error("GEMINI_API_KEY is not defined in the environment");
}
const genAI=new GoogleGenerativeAI(apiKey);

const model=genAI.getGenerativeModel({model:"gemini-1.5-flash",})


export const generateIndustryInsights=inngest.createFunction(
  {
    name: "Generate Industry Insights",
    id: ""
  },
  {cron: "0 0 * * 0"},
  async ({step})=>{
    const industries =await step.run("Fetch industries", async ()=>{
      return await db.industryInsight.findMany({
        select:{industry:true},
      })
    });
    for(const {industry} of industries){
      const prompt = `
          Analyze the current state of the ${industry} industry and provide insights in ONLY the following JSON format without any additional notes or explanations:
          {
            "salaryRanges": [
              { "role": "string", "min": number, "max": number, "median": number, "location": "string" }
            ],
            "growthRate": number,
            "demandLevel": "HIGH" | "MEDIUM" | "LOW",
            "topSkills": ["skill1", "skill2"],
            "arketOutlook": "POSITIVE" | "NEUTRAL" | "NEGATIVE",
            "keyTrends": ["trend1", "trend2"],
            "recommendedSkills": ["skill1", "skill2"]
          }
          
          IMPORTANT: Return ONLY the JSON. No additional text, notes, or markdown formatting.
          Include at least 5 common roles for salary ranges.
          Growth rate should be a percentage.
          Include at least 5 skills and trends.
        `;                                           
        const res= await step.ai.wrap("gemini", async(p)=>{
          return await model.generateContent(p);
        },prompt);
        
        
        const candidates = res.response.candidates;

if (!candidates || candidates.length === 0) {
  throw new Error("No candidates returned by Gemini model");
}

const parts = candidates[0].content.parts;

if (!parts || parts.length === 0 || typeof parts[0] !== "object" || !("text" in parts[0])) {
  throw new Error("Unexpected format in Gemini response parts");
}

const text = (parts[0] as { text: string }).text;



      const cleanedText = text.replace(/```(?:json)?\n?/g, "").trim();
       const insights = JSON.parse(cleanedText);
        
        await step.run(`Update ${industry} insights`, async () => {
        await db.industryInsight.update({
          where: { industry },
          data: {
            ...insights,
            lastUpdated: new Date(),
            nextUpdate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
          },
        });
      });


    }
  
    }
);

 