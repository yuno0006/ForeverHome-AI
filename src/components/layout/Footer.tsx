import Image from "next/image";

export default function Footer() {
  return (
    <footer className="bg-white/60 backdrop-blur-sm border-t border-sunny/20 mt-auto">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Image
              src="/cat.png"
              alt="ForeverHome"
              width={24}
              height={24}
              className="rounded-md"
            />
            <span className="text-sm font-semibold text-cat-dark">
              ForeverHome AI
            </span>
          </div>
          <p className="text-xs text-charcoal/50 text-center sm:text-right max-w-md">
            ForeverHome AI is not a replacement for shelter professionals or
            veterinarians. It is a decision-support and adopter-education
            platform.
          </p>
        </div>
      </div>
    </footer>
  );
}
