import { demoCats } from "@/data/demoCats";
import CatCard from "@/components/cats/CatCard";

export default function CatsPage() {
  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="text-center mb-10">
        <h1 className="text-3xl sm:text-4xl font-bold text-cat-dark">
          Choose a Cat
        </h1>
        <p className="mt-3 text-lg text-charcoal/50 max-w-2xl mx-auto">
          Select a cat to begin the compatibility assessment. Each cat has unique
          behavioral needs that will be compared with your home and lifestyle.
        </p>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {demoCats.map((cat) => (
          <CatCard key={cat.id} cat={cat} />
        ))}
      </div>
    </div>
  );
}
