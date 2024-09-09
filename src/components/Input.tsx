import { ComponentPropsWithoutRef, forwardRef } from "react";

type InputProps = ComponentPropsWithoutRef<"input">;

type LabeledInputProps = InputProps & {
    id: string;
    label: string;
};

export const Input = forwardRef<HTMLInputElement, InputProps>((props, ref) => {
    return (
        <input
            className="p-2 bg-[#fafaf5] outline-none border border-gray-300"
            ref={ref}
            {...props}
        />
    );
});

export const LabeledInput = forwardRef<HTMLInputElement, LabeledInputProps>(
    ({ label, ...inputProps }, ref) => {
        return (
            <div className="flex flex-col gap-1">
                <label htmlFor={inputProps.id}>{label}</label>
                <Input ref={ref} {...inputProps} />
            </div>
        );
    },
);
