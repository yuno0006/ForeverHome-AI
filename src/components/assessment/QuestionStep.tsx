import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";

interface QuestionStepProps {
  question: string;
  description?: string;
  options: { value: string; label: string }[];
  value: string;
  onChange: (value: string) => void;
  name: string;
}

export default function QuestionStep({
  question,
  description,
  options,
  value,
  onChange,
  name,
}: QuestionStepProps) {
  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-lg font-semibold text-cat-dark">{question}</h3>
        {description && (
          <p className="text-sm text-charcoal/50 mt-1">{description}</p>
        )}
      </div>
      <RadioGroup value={value} onValueChange={onChange} name={name}>
        {options.map((option) => (
          <Label
            key={option.value}
            htmlFor={`${name}-${option.value}`}
            className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-colors ${
              value === option.value
                ? "border-sunny bg-sunny/5"
                : "border-border hover:border-sunny/50"
            }`}
          >
            <RadioGroupItem
              id={`${name}-${option.value}`}
              value={option.value}
            />
            <span className="text-sm">{option.label}</span>
          </Label>
        ))}
      </RadioGroup>
    </div>
  );
}
