import { useCallback } from "react";
import type { ChangeEvent } from "react";
import {
  normSingleLine,
  normMultiline,
  maskCPFCNPJ,
  maskPhone,
  maskCEP,
  maskUF,
  maskBRDate,
} from "@/utils/sanitize";

type MaskType = "text" | "multiline" | "cpfcnpj" | "phone" | "cep" | "uf" | "date" | "number" | "url";

interface UseMaskedInputOptions {
  mask: MaskType;
  max?: number;
  onChange: (value: string) => void;
}

/** Returns an onChange handler that applies the appropriate mask/normalization */
export function useMaskedInput({ mask, max, onChange }: UseMaskedInputOptions) {
  return useCallback(
    (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      const raw = e.target.value;
      let next: string;

      switch (mask) {
        case "text":
          next = normSingleLine(raw, max ?? 120);
          break;
        case "multiline":
          next = normMultiline(raw, max ?? 2000);
          break;
        case "cpfcnpj":
          next = maskCPFCNPJ(raw);
          break;
        case "phone":
          next = maskPhone(raw);
          break;
        case "cep":
          next = maskCEP(raw);
          break;
        case "uf":
          next = maskUF(raw);
          break;
        case "date":
          next = maskBRDate(raw);
          break;
        case "url":
          // only https:// allowed — strip other schemes
          next = raw.replace(/^https?:\/\//i, "https://");
          break;
        case "number":
          next = raw.replace(/[^0-9.,]/g, "");
          break;
        default:
          next = raw;
      }

      onChange(next);
    },
    [mask, max, onChange],
  );
}
