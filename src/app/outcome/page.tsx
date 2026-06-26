import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { X, Check, Heart } from "lucide-react";

export default function OutcomePage() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="text-center mb-10">
        <h1 className="text-3xl sm:text-4xl font-bold text-cat-dark">
          The ForeverHome Difference
        </h1>
        <p className="mt-3 text-lg text-charcoal/50 max-w-2xl mx-auto">
          Barnaby&apos;s story — an illustration of how structured assessment
          and post-adoption support can change outcomes.
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-6 mb-12">
        {/* Without ForeverHome */}
        <Card className="border-risk-high/30 bg-white">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg text-risk-high flex items-center gap-2">
              <X className="h-5 w-5" />
              Without ForeverHome
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-start gap-3">
              <X className="h-4 w-4 text-risk-high mt-1 shrink-0" />
              <p className="text-sm text-foreground">
                Barnaby is adopted without a structured compatibility review
              </p>
            </div>
            <div className="flex items-start gap-3">
              <X className="h-4 w-4 text-risk-high mt-1 shrink-0" />
              <p className="text-sm text-foreground">
                The busy household overwhelms him
              </p>
            </div>
            <div className="flex items-start gap-3">
              <X className="h-4 w-4 text-risk-high mt-1 shrink-0" />
              <p className="text-sm text-foreground">
                His hiding is misunderstood as rejection
              </p>
            </div>
            <div className="flex items-start gap-3">
              <X className="h-4 w-4 text-risk-high mt-1 shrink-0" />
              <p className="text-sm text-foreground">
                Shelter has no visibility into his adjustment
              </p>
            </div>
            <div className="flex items-start gap-3">
              <X className="h-4 w-4 text-risk-high mt-1 shrink-0" />
              <p className="text-sm text-foreground font-medium">
                He is returned to the shelter
              </p>
            </div>
          </CardContent>
        </Card>

        {/* With ForeverHome */}
        <Card className="border-risk-low/30 bg-white">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg text-risk-low flex items-center gap-2">
              <Check className="h-5 w-5" />
              With ForeverHome
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-start gap-3">
              <Check className="h-4 w-4 text-risk-low mt-1 shrink-0" />
              <p className="text-sm text-foreground">
                Compatibility concerns are identified before adoption
              </p>
            </div>
            <div className="flex items-start gap-3">
              <Check className="h-4 w-4 text-risk-low mt-1 shrink-0" />
              <p className="text-sm text-foreground">
                The shelter recommends a quieter home for Barnaby
              </p>
            </div>
            <div className="flex items-start gap-3">
              <Check className="h-4 w-4 text-risk-low mt-1 shrink-0" />
              <p className="text-sm text-foreground">
                The adopter receives personalized transition support
              </p>
            </div>
            <div className="flex items-start gap-3">
              <Check className="h-4 w-4 text-risk-low mt-1 shrink-0" />
              <p className="text-sm text-foreground">
                Daily check-ins build a visible progress timeline
              </p>
            </div>
            <div className="flex items-start gap-3">
              <Check className="h-4 w-4 text-risk-low mt-1 shrink-0" />
              <p className="text-sm text-foreground">
                Shelter can monitor and intervene proactively
              </p>
            </div>
            <div className="flex items-start gap-3">
              <Check className="h-4 w-4 text-risk-low mt-1 shrink-0" />
              <p className="text-sm text-foreground font-medium">
                Barnaby has a better-supported path to a permanent home
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Progress Story */}
      <Card className="border-border bg-white mb-12">
        <CardHeader>
          <CardTitle className="text-xl text-cat-dark flex items-center gap-2">
            <Heart className="h-6 w-6 text-heart fill-heart" />
            Barnaby&apos;s Progress Timeline
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[
              { day: 1, text: "Wouldn't leave carrier for 4 hours", hiding: true },
              { day: 2, text: "Explored room briefly at night", hiding: true },
              { day: 3, text: "Came out for a few minutes, ate treats from hand", hiding: true },
              { day: 5, text: "Slept on the end of the bed!", hiding: false },
              { day: 7, text: "Playing with feather toy, lets me pet him", hiding: false },
              { day: 10, text: "Sitting on the couch next to me. This feels like home.", hiding: false },
            ].map((entry) => (
              <div
                key={entry.day}
                className={`flex items-start gap-4 p-3 rounded-lg border-l-4 ${
                  entry.hiding
                    ? "border-l-risk-high/40 bg-risk-high/5"
                    : "border-l-risk-low/60 bg-risk-low/5"
                }`}
              >
                <span className="text-sm font-bold text-cat-dark w-16 shrink-0">
                  Day {entry.day}
                </span>
                <p className="text-sm text-foreground italic">
                  &quot;{entry.text}&quot;
                </p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Closing */}
      <div className="text-center bg-sunny rounded-xl p-8 text-white">
        <p className="text-lg font-medium mb-2">
          ForeverHome does not just help cats find homes.
        </p>
        <p className="text-2xl font-bold">
          It helps them keep those homes — and establish one more permanent base
          for peaceful world domination.
        </p>
      </div>

      {/* Disclaimer */}
      <p className="text-xs text-charcoal/50 text-center mt-8">
        This is an illustrative story, not a claim that the application
        guarantees an outcome. Individual results will vary.
      </p>
    </div>
  );
}
