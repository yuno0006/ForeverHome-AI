import { NextResponse } from "next/server";
import { generateDynamicQuestions } from "@/lib/gemini";
import { getCatById } from "@/data/demoCats";

export async function POST(req: Request) {
  try {
    const { catId, adopterProfileStr } = await req.json();
    if (!catId || !adopterProfileStr) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const cat = getCatById(catId);
    if (!cat) {
      return NextResponse.json({ error: "Cat not found" }, { status: 404 });
    }

    const catProfileStr = `Behavior: ${cat.behavior.energy} energy, ${cat.behavior.sociability} sociability, ${cat.behavior.stressSensitivity} stress sensitivity. 
Comfortable with: Children (${cat.behavior.comfortableWithChildren}), Dogs (${cat.behavior.comfortableWithDogs}), Cats (${cat.behavior.comfortableWithCats}).
Medical: ${cat.care.knownMedicalNeeds}. 
Personality: ${cat.personality?.map(p => p.trait).join(", ")}`;

    const questions = await generateDynamicQuestions(cat.name, catProfileStr, adopterProfileStr);
    
    if (!questions) {
      return NextResponse.json({ error: "Failed to generate questions" }, { status: 500 });
    }

    return NextResponse.json({ questions });
  } catch (error) {
    console.error("Error in generate-questions API:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
