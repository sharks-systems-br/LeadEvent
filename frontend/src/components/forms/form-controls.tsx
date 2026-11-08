"use client";

import * as React from "react";
import {
  Check,
  ChevronDown,
  Info,
  UploadCloud,
  X,
  type LucideIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { formatFileSize, isVideoFile } from "@/lib/form-validation";
import { MAX_VIDEO_SIZE_MB, VIDEO_ACCEPT } from "@/lib/video-validation";

export const controlBase =
  "w-full border border-black/10 bg-white text-sm text-foreground shadow-[0_1px_0_rgba(0,0,0,0.02)] outline-none transition placeholder:text-muted-foreground/60 focus:border-black/30 focus:ring-4 focus:ring-black/[0.05] disabled:cursor-not-allowed disabled:bg-neutral-50 disabled:opacity-70";

export const invalidControl =
  "border-red-300 focus:border-red-400 focus:ring-red-500/10";

interface FieldProps {
  label: string;
  htmlFor: string;
  hint?: React.ReactNode;
  error?: string;
  optional?: boolean;
  className?: string;
  children: React.ReactNode;
}

export function Field({
  label,
  htmlFor,
  hint,
  error,
  optional,
  className,
  children,
}: FieldProps) {
  const hintId = hint ? `${htmlFor}-hint` : undefined;
  const errorId = error ? `${htmlFor}-error` : undefined;

  return (
    <div className={cn("space-y-2", className)}>
      <div className="flex flex-wrap items-baseline justify-between gap-x-3 gap-y-1">
        <label
          htmlFor={htmlFor}
          className="text-sm font-medium leading-none text-foreground"
        >
          {label}
          {optional && (
            <span className="ml-1.5 text-xs font-normal text-muted-foreground">
              (opcional)
            </span>
          )}
        </label>
        {hint && (
          <span id={hintId} className="text-[11px] text-muted-foreground">
            {hint}
          </span>
        )}
      </div>

      {children}

      {error && (
        <p
          id={errorId}
          role="alert"
          className="flex items-start gap-1.5 text-xs font-medium text-red-600"
        >
          <Info className="mt-px size-3.5 shrink-0" />
          {error}
        </p>
      )}
    </div>
  );
}

interface FormSectionProps {
  step: string;
  title: string;
  description?: string;
  icon?: LucideIcon;
  children: React.ReactNode;
}

export function FormSection({
  step,
  title,
  description,
  icon: Icon,
  children,
}: FormSectionProps) {
  return (
    <section className="border-t border-black/[0.07] pt-8 first:border-t-0 first:pt-0">
      <div className="mb-5 flex items-start gap-3">
        <span className="flex size-8 shrink-0 items-center justify-center rounded-full border border-black/10 bg-white text-[11px] font-semibold text-muted-foreground shadow-sm">
          {step}
        </span>
        <div className="min-w-0">
          <h2 className="flex items-center gap-2 text-[15px] font-semibold tracking-tight text-foreground">
            {title}
            {Icon && <Icon className="size-3.5 text-muted-foreground/70" />}
          </h2>
          {description && (
            <p className="mt-0.5 text-xs leading-relaxed text-muted-foreground">
              {description}
            </p>
          )}
        </div>
      </div>

      <div className="space-y-5">{children}</div>
    </section>
  );
}

type TextInputProps = React.ComponentProps<"input"> & {
  invalid?: boolean;
  leading?: React.ReactNode;
};

export function TextInput({
  className,
  invalid,
  leading,
  ...props
}: TextInputProps) {
  return (
    <div className="relative">
      {leading && (
        <span
          aria-hidden="true"
          className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-sm font-medium text-muted-foreground"
        >
          {leading}
        </span>
      )}
      <input
        {...props}
        aria-invalid={invalid || undefined}
        className={cn(
          controlBase,
          "h-12 rounded-xl px-4",
          leading && "pl-9",
          invalid && invalidControl,
          className
        )}
      />
    </div>
  );
}

type TextareaProps = React.ComponentProps<"textarea"> & {
  invalid?: boolean;
};

export function Textarea({ className, invalid, ...props }: TextareaProps) {
  return (
    <textarea
      {...props}
      aria-invalid={invalid || undefined}
      className={cn(
        controlBase,
        "min-h-32 resize-y rounded-xl px-4 py-3 leading-relaxed",
        invalid && invalidControl,
        className
      )}
    />
  );
}

type SelectInputProps = React.ComponentProps<"select"> & {
  invalid?: boolean;
  placeholder?: string;
};

export function SelectInput({
  className,
  invalid,
  placeholder = "Selecione",
  children,
  value,
  ...props
}: SelectInputProps) {
  return (
    <div className="relative">
      <select
        {...props}
        value={value}
        aria-invalid={invalid || undefined}
        className={cn(
          controlBase,
          "h-12 appearance-none rounded-xl pl-4 pr-10",
          (value === "" || value === undefined) &&
            "text-muted-foreground/70",
          invalid && invalidControl,
          className
        )}
      >
        <option value="" disabled>
          {placeholder}
        </option>
        {children}
      </select>
      <ChevronDown
        aria-hidden="true"
        className="pointer-events-none absolute right-4 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
      />
    </div>
  );
}

export interface ChoiceOption {
  value: string;
  label: string;
  description?: string;
}

interface ChoiceCardsProps {
  name: string;
  options: ChoiceOption[];
  value: string | string[];
  onChange: (value: string) => void;
  type?: "radio" | "checkbox";
  columns?: 1 | 2;
  invalid?: boolean;
  ariaLabel?: string;
}

export function ChoiceCards({
  name,
  options,
  value,
  onChange,
  type = "radio",
  columns = 2,
  invalid,
  ariaLabel,
}: ChoiceCardsProps) {
  const isSelected = (optionValue: string) =>
    Array.isArray(value)
      ? value.includes(optionValue)
      : value === optionValue;

  return (
    <div
      role={type === "radio" ? "radiogroup" : "group"}
      aria-label={ariaLabel ?? name}
      aria-invalid={invalid || undefined}
      className={cn(
        "grid gap-2.5",
        columns === 2 && "sm:grid-cols-2",
        invalid && "rounded-2xl ring-1 ring-red-300 ring-offset-4"
      )}
    >
      {options.map((option) => {
        const selected = isSelected(option.value);

        return (
          <label
            key={option.value}
            className={cn(
              "group relative flex cursor-pointer items-start justify-between gap-3 rounded-2xl border p-3.5 transition-all duration-200",
              "has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-black/25 has-[:focus-visible]:ring-offset-2",
              selected
                ? "border-foreground bg-foreground text-background shadow-lg shadow-black/10"
                : "border-black/10 bg-white/80 text-foreground hover:border-black/25 hover:bg-black/[0.02]"
            )}
          >
            <input
              type={type}
              name={name}
              value={option.value}
              checked={selected}
              onChange={() => onChange(option.value)}
              className="sr-only"
            />

            <span className="min-w-0">
              <span className="block text-sm font-medium leading-snug">
                {option.label}
              </span>
              {option.description && (
                <span
                  className={cn(
                    "mt-1 block text-[11px] leading-relaxed",
                    selected ? "text-background/65" : "text-muted-foreground"
                  )}
                >
                  {option.description}
                </span>
              )}
            </span>

            <span
              aria-hidden="true"
              className={cn(
                "mt-0.5 flex size-5 shrink-0 items-center justify-center border transition-colors",
                type === "radio" ? "rounded-full" : "rounded-md",
                selected
                  ? "border-background/30 bg-background text-foreground"
                  : "border-black/15 bg-transparent text-transparent"
              )}
            >
              {type === "radio" ? (
                <span className="size-2 rounded-full bg-current" />
              ) : (
                <Check className="size-3.5" strokeWidth={3} />
              )}
            </span>
          </label>
        );
      })}
    </div>
  );
}

interface ConsentCheckboxProps {
  id: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
  error?: string;
  children: React.ReactNode;
}

export function ConsentCheckbox({
  id,
  checked,
  onChange,
  error,
  children,
}: ConsentCheckboxProps) {
  return (
    <div className="space-y-2">
      <label
        htmlFor={id}
        className={cn(
          "flex cursor-pointer items-start gap-3 rounded-2xl border bg-white/80 p-4 transition-colors",
          "has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-black/25 has-[:focus-visible]:ring-offset-2",
          checked
            ? "border-black/25 bg-black/[0.03]"
            : "border-black/10 hover:border-black/20",
          error && "border-red-300"
        )}
      >
        <input
          id={id}
          type="checkbox"
          checked={checked}
          onChange={(event) => onChange(event.target.checked)}
          aria-invalid={error ? true : undefined}
          className="peer sr-only"
        />
        <span
          aria-hidden="true"
          className={cn(
            "mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-md border transition-colors",
            checked
              ? "border-foreground bg-foreground text-background"
              : "border-black/20 bg-white text-transparent"
          )}
        >
          <Check className="size-3.5" strokeWidth={3} />
        </span>
        <span className="text-[13px] leading-relaxed text-muted-foreground">
          {children}
        </span>
      </label>

      {error && (
        <p role="alert" className="text-xs font-medium text-red-600">
          {error}
        </p>
      )}
    </div>
  );
}

interface UploadDropzoneProps {
  id: string;
  file: File | null;
  onFileChange: (file: File | null) => void;
  onReject: (message: string) => void;
  accept?: string;
  maxSizeMb?: number;
  invalid?: boolean;
}

export function UploadDropzone({
  id,
  file,
  onFileChange,
  onReject,
  accept = VIDEO_ACCEPT,
  maxSizeMb = MAX_VIDEO_SIZE_MB,
  invalid,
}: UploadDropzoneProps) {
  const [dragging, setDragging] = React.useState(false);

  const handleFile = (selected: File | undefined) => {
    if (!selected) return;

    if (!selected.type.startsWith("video/") && !isVideoFile(selected)) {
      onReject(
        "Envie um arquivo de vídeo válido (MP4, MOV, MKV, AVI, WEBM, WMV...)."
      );
      return;
    }

    if (selected.size > maxSizeMb * 1024 * 1024) {
      onReject(`O arquivo deve ter no máximo ${maxSizeMb} MB.`);
      return;
    }

    onFileChange(selected);
  };

  return (
    <div className="space-y-2">
      <label
        htmlFor={id}
        onDragEnter={(event) => {
          event.preventDefault();
          setDragging(true);
        }}
        onDragOver={(event) => {
          event.preventDefault();
          setDragging(true);
        }}
        onDragLeave={(event) => {
          event.preventDefault();
          setDragging(false);
        }}
        onDrop={(event) => {
          event.preventDefault();
          setDragging(false);
          handleFile(event.dataTransfer.files[0]);
        }}
        className={cn(
          "group flex cursor-pointer flex-col items-center justify-center rounded-2xl border border-dashed px-5 py-7 text-center transition-all duration-200",
          "has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-black/25 has-[:focus-visible]:ring-offset-2",
          dragging
            ? "border-foreground/50 bg-black/[0.04]"
            : "border-black/15 bg-black/[0.015] hover:border-black/30 hover:bg-black/[0.03]",
          invalid && "border-red-300 bg-red-50/40",
          file && "border-solid border-black/20 bg-white"
        )}
      >
        <input
          id={id}
          type="file"
          accept={accept}
          className="sr-only"
          onChange={(event) => {
            handleFile(event.target.files?.[0]);
            event.target.value = "";
          }}
        />

        <span
          aria-hidden="true"
          className={cn(
            "flex size-11 items-center justify-center rounded-2xl border transition-colors",
            file
              ? "border-foreground bg-foreground text-background"
              : "border-black/10 bg-white text-muted-foreground group-hover:text-foreground"
          )}
        >
          {file ? <Check className="size-5" /> : <UploadCloud className="size-5" />}
        </span>

        <span className="mt-3 block max-w-full truncate text-sm font-medium text-foreground">
          {file ? file.name : "Arraste seu vídeo ou clique para enviar"}
        </span>

        <span className="mt-1 block text-[11px] text-muted-foreground">
          {file
            ? `${formatFileSize(file.size)} · pronto para a prévia`
            : `MP4, MOV, MKV, AVI, WEBM, WMV e mais · até ${maxSizeMb} MB · 2 min`}
        </span>
      </label>

      {file && (
        <button
          type="button"
          onClick={() => onFileChange(null)}
          className="inline-flex items-center gap-1.5 text-xs font-medium text-muted-foreground transition-colors hover:text-foreground"
        >
          <X className="size-3.5" />
          Remover arquivo
        </button>
      )}
    </div>
  );
}

type SubmitButtonProps = React.ComponentProps<"button"> & {
  icon?: LucideIcon;
};

export function SubmitButton({
  className,
  children,
  icon: Icon,
  ...props
}: SubmitButtonProps) {
  return (
    <button
      {...props}
      className={cn(
        "group inline-flex h-12 items-center justify-center gap-2 rounded-xl bg-foreground px-6 text-sm font-semibold text-background transition-all duration-200",
        "hover:bg-black hover:shadow-lg hover:shadow-black/15 active:scale-[0.99]",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-black/30 focus-visible:ring-offset-2",
        "disabled:pointer-events-none disabled:opacity-60",
        className
      )}
    >
      {children}
      {Icon && (
        <Icon className="size-4 transition-transform duration-200 group-hover:translate-x-0.5" />
      )}
    </button>
  );
}
