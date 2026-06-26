import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";

interface ScenarioQuestionProps {
  scenario: string;
  options: { value: string; label: string }[];
  value: string;
  onChange: (value: string) => void;
  name: string;
}

export default function ScenarioQuestion({
  scenario,
  options,
  value,
  onChange,
  name,
}: ScenarioQuestionProps) {
  return (
    <div className="space-y-4">
      <div className="bg-warm-cream rounded-lg p-4 border border-border">
        <p className="text-sm font-medium text-cat-dark italic">&quot;{scenario}&quot;</p>
      </div>
      <RadioGroup value={value} onValueChange={onChange} name={name}>
        {options.map((option) => (
          <Label
            key={option.value}
            htmlFor={`${name}-${option.value}`}
            className={`flex items-start gap-3 p-3 rounded-lg border cursor-pointer transition-colors ${
              value === option.value
                ? "border-sunny bg-sunny/5"
                : "border-border hover:border-sunny/50"
            }`}
          >
            <RadioGroupItem
              id={`${name}-${option.value}`}
              value={option.value}
              className="mt-0.5"
            />
            <span className="text-sm">{option.label}</span>
          </Label>
        ))}
      </RadioGroup>
    </div>
  );
}
