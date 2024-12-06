import { Input } from "@/components/ui/input.tsx";
import { FilterBaseProps } from "./common";
import { SchemaMinMaxFilter } from "@/api/types";
import { BaseFilter } from "./BaseFilter";

export function MinMaxFilter(
  props: FilterBaseProps<SchemaMinMaxFilter | null | undefined>,
) {
  const { disabled, value, onChange, ...rest } = props;

  const handleMinChange = (v: number | null) => {
    onChange({ ...value, min: v });
  };
  const handleMaxChange = (v: number | null) => {
    onChange({ ...value, max: v });
  };

  return (
    <BaseFilter {...rest}>
      <div className="flex items-center gap-2">
        <Input
          disabled={disabled}
          type="number"
          min={0}
          value={value?.min || ''}
          onChange={(e) => {
            handleMinChange(e.target.value ? Number(e.target.value) : null);
          }}
          placeholder="от"
          className="w-fit max-w-[90px]"
        />
        {"—"}
        <Input
          disabled={disabled}
          type="number"
          min={0}
          value={value?.max || ''}
          onChange={(e) => {
            handleMaxChange(e.target.value ? Number(e.target.value) : null);
          }}
          placeholder="до"
          className="w-fit max-w-[90px]"
        />
      </div>
    </BaseFilter>
  );
}
