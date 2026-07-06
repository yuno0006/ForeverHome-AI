import { NextResponse } from "next/server";
import { generateDynamicQuestions } from "@/lib/gemini";
import { getCatById } from "@/data/demoCats";

export async function POST(req: Request) {
  try {
    const { catId, adopterProfileStr, mode } = await req.json();
    if (!catId) {
      return NextResponse.json({ error: "Missing catId" }, { status: 400 });
    }

    const cat = getCatById(catId);
    if (!cat) {
      return NextResponse.json({ error: "Cat not found" }, { status: 404 });
    }

    const catProfileStr = `Behavior: ${cat.behavior.energy} energy, ${cat.behavior.sociability} sociability, ${cat.behavior.stressSensitivity} stress sensitivity. 
Comfortable with: Children (${cat.behavior.comfortableWithChildren}), Dogs (${cat.behavior.comfortableWithDogs}), Cats (${cat.behavior.comfortableWithCats}).
Medical: ${cat.care.knownMedicalNeeds}. 
Personality: ${cat.personality?.map(p => p.trait).join(", ")}`;

    // Quick match mode: generate lifestyle-fit questions without requiring adopter profile
    if (mode === "quick") {
      const adopterContext = adopterProfileStr || "Unknown adopter profile - generate general cat compatibility lifestyle questions";
      const questions = await generateDynamicQuestions(cat.name, catProfileStr, adopterContext);
      if (!questions) {
        return NextResponse.json({ error: "Failed to generate questions" }, { status: 500 });
      }
      return NextResponse.json({ questions: questions.slice(0, 4) });
    }

    if (!adopterProfileStr) {
      return NextResponse.json({ error: "Missing adopterProfileStr" }, { status: 400 });
    }

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
