"use server";

import { db } from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";
import { generateAIInsights } from "./dahsboard";



function normalizeAIInsights(ai: any) {
  return {
    salaryRanges: ai.salaryRanges,
    growthRate: ai.growthRate,
    demandLevel: ai.demandLevel.toUpperCase(),
    marketOutlook: (ai.MarketOutlook || ai.marketOutlook).toUpperCase(),
    topSkills: ai.topSkills,
    keyTrends: ai.keyTrends,
    recommendedSkills: ai.recommendedSkills,
  };
}


type UpdateUserInput = {
  bio?: string;
  experience?: number;
  skills?: string[];
  industry?: string;
};
export async function updateUser(data:UpdateUserInput) {
  const{userId}=await auth();
  if(!userId) throw new Error ("Unauthorized");

  const user=await db.user.findUnique({
    where:{
      clerkUserId:userId, 
    },
  });
  if(!user) throw new Error("User Not Found!");

  try{

    const result=await db.$transaction(
      async(tx)=>{
        if (!data.industry) throw new Error("Industry is required");
           //find if the industry exists
            let industryInsight=await tx.industryInsight.findUnique({
              where:{
                industry:data.industry,
              }
            });
      //if industry doesn't exist, create it with defaultu values -will replace it with ai later
      if(!industryInsight){
        const rawInsights = await generateAIInsights(data.industry);

// Normalize enums and key name
const insights = {
  ...rawInsights,
  demandLevel: rawInsights.demandLevel.toUpperCase(),
  marketOutlook: (rawInsights.marketOutlook || rawInsights.MarketOutlook).toUpperCase(),
};

industryInsight = await tx.industryInsight.create({
  data: {
    industry: data.industry,
    ...insights,
    nextUpdate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
  },
});
       
      }
      //update the user
      const updatedUser=await tx.user.update({
        where:{
          id:user.id,
        },
        data:{
          industry:data.industry,
          experience:data.experience,
          bio:data.bio,
          skills:data.skills,
        }
      });
      return {updateUser,industryInsight}
      },
      { timeout:10000,

      }
    );
     
    return {success:true,...result};
  }catch (error:any){
    console.error("error updating user and industry:",error.message);
    throw new Error("failed to update profile");
  }
}

export async function getUserOnboardingStatus() {
  const{userId}=await auth();
  if(!userId) throw new Error ("Unauthorized");

  const user=await db.user.findUnique({
    where:{
      clerkUserId:userId, 
    },
  });
  if(!user) throw new Error("User Not Found!");
  try{
    const user=await db.user.findUnique({
      where:{
        clerkUserId:userId,
      },
      select:{
        industry:true,
      },
    });
    return {
      isOnboarded: !!user?.industry,
    };
  }catch(error:any){
    console.error("erro checking onboarding status:",error.message);
    throw new Error("Failed to check onbaording status");
  }
}