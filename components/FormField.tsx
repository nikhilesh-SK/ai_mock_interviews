/**
 * FormField Component
 * 
 * A reusable form field wrapper that integrates react-hook-form
 * with shadcn/ui form components. Handles label, input, and
 * error message display in a consistent layout.
 * 
 * Uses generics to work with any form schema type.
 */

import { useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import { Controller, Control, FieldValues, Path } from "react-hook-form";

import {
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";

/**
 * Props for the FormField component
 * 
 * @template T - The form schema type (extends FieldValues)
 */
interface FormFieldProps<T extends FieldValues> {
  control: Control<T>;         // react-hook-form control object
  name: Path<T>;               // Field name (must be a valid path in the schema)
  label: string;               // Display label for the field
  placeholder?: string;        // Optional placeholder text
  type?: "text" | "email" | "password";  // Input type
}

/**
 * FormField Component
 * 
 * A generic form field that works with any react-hook-form schema.
 * Wraps the Controller component for controlled input handling.
 * 
 * @template T - Form schema type for type safety
 * 
 * @example
 * <FormField
 *   control={form.control}
 *   name="email"
 *   label="Email Address"
 *   placeholder="you@example.com"
 *   type="email"
 * />
 */
const FormField = <T extends FieldValues>({
  control,
  name,
  label,
  placeholder,
  type = "text",
}: FormFieldProps<T>) => {
  const [showPassword, setShowPassword] = useState(false);
  const isPassword = type === "password";
  const inputType = isPassword ? (showPassword ? "text" : "password") : type;

  return (
    <Controller
      control={control}
      name={name}
      render={({ field }) => (
        <FormItem>
          {/* Field label */}
          <FormLabel className="label">{label}</FormLabel>

          {/* Input control */}
          <div className="relative">
            <FormControl>
              <Input
                className={`input ${isPassword ? "pr-10" : ""}`}
                type={inputType}
                placeholder={placeholder}
                {...field} // Spreads value, onChange, onBlur, etc.
              />
            </FormControl>

            {isPassword && (
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 flex items-center justify-center"
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            )}
          </div>

          {/* Error message (automatically shown when validation fails) */}
          <FormMessage />
        </FormItem>
      )}
    />
  );
};

export default FormField;
