import { AbstractControl, ValidationErrors, ValidatorFn } from "@angular/forms";
import { IECFileSize, SIFileSize } from "./constants";
import {
  DropzoneValidatorError,
  FileDropzone,
  FileDropzoneErrorCode,
  SizeDisplayStandard,
} from "./types";

export function formatBytes(
  bytes: number,
  standard: SizeDisplayStandard,
): string {
  let kB: number = 0;
  let MB: number = 0;

  switch (standard) {
    case "IEC":
      kB = IECFileSize.kB;
      MB = IECFileSize.MB;
      break;
    case "SI":
      kB = SIFileSize.kB;
      MB = SIFileSize.MB;
      break;
    default:
      throw new Error(`Unknown filesize display standard: ${standard}`);
  }
  if (bytes >= MB) {
    const mbString = standard === "SI" ? "MB" : "MiB";
    return `${roundNumber(bytes / MB)} ${mbString}`;
  }
  if (bytes >= kB) {
    const bytesString = standard === "SI" ? "kB" : "KiB";
    return `${roundNumber(bytes / kB)} ${bytesString}`;
  }
  return `${bytes} B`;
}

export function roundNumber(num: number, decimals = 2): string {
  const rounded = num.toFixed(decimals);
  return rounded.includes(".") ? rounded.replace(/\.?0+$/, "") : rounded;
}

export function getDefaultHelpers(
  accept: string,
  maxSize: number,
  standard: SizeDisplayStandard,
  translate?: (key: string, ...args: unknown[]) => string,
): string {
  if (!translate)
    throw new Error(
      "Translate function is required to generate default helpers.",
    );
  const textArray = [];
  if (accept) {
    textArray.push(
      `${translate("file-upload.accept")} ${accept.replaceAll(",", ", ")}`,
    );
  }
  if (maxSize) {
    textArray.push(
      `${translate("file-upload.max-size")} ${formatBytes(maxSize, standard)}`,
    );
  }
  return textArray.filter(Boolean).join(". ");
}

function sanitizeFileList(files: FileDropzone[] | unknown): FileDropzone[] {
  if (!Array.isArray(files)) {
    return [];
  }
  return files.filter((file) => file instanceof FileDropzone);
}

export const validateFileSize =
  (
    maxSize: number,
    standard: SizeDisplayStandard,
    translate: (key: string, ...args: unknown[]) => string,
  ): ValidatorFn =>
  (control: AbstractControl<unknown>): ValidationErrors | null => {
    if (maxSize === 0) {
      return null;
    }
    const files = sanitizeFileList(control.value);

    if (!files.length) {
      return null;
    }

    const errors: ValidationErrors = {};
    files.forEach((file) => {
      const err = validateSingleFileSize(file, maxSize, standard, translate);
      if (err) {
        errors[err.errorKey] = err.value;
      }
    });

    if (Object.keys(errors).length) {
      return errors;
    }

    return null;
  };

const validateSingleFileSize = (
  file: FileDropzone,
  maxSize: number,
  standard: SizeDisplayStandard,
  translate: (key: string, ...args: unknown[]) => string,
): DropzoneValidatorError | null => {
  if (file.size > maxSize) {
    return {
      errorKey: FileDropzoneErrorCode.FILE_TOO_LARGE,
      value: {
        fileName: file.name,
        message: translate(
          "file-upload.size-rejected-extended",
          file.name,
          formatBytes(maxSize, standard),
        ),
      },
    };
  }
  return null;
};

export const validateFileType =
  (
    acceptFileTypes: string,
    translate: (key: string, ...args: unknown[]) => string,
  ): ValidatorFn =>
  (control: AbstractControl<unknown>): ValidationErrors | null => {
    const files = sanitizeFileList(control.value);

    if (!files.length) {
      return null;
    }

    if (acceptFileTypes) {
      const errors: ValidationErrors = {};

      files.forEach((file) => {
        const err = validateSingleFileType(file, acceptFileTypes, translate);
        if (err) {
          errors[err.errorKey] = err.value;
        }
      });

      if (Object.keys(errors).length) {
        return errors;
      }
    }
    return null;
  };

const validateSingleFileType = (
  file: FileDropzone,
  acceptFileTypes: string,
  translate: (key: string, ...args: unknown[]) => string,
): DropzoneValidatorError | null => {
  const validTypes = acceptFileTypes
    .split(",")
    .map((type) => type.trim().toLowerCase());

  const fileType = file.type.toLowerCase();
  const fileName = file.name.toLowerCase();

  const matches = validTypes.some((type) => {
    if (type.startsWith(".")) {
      return fileName.endsWith(type);
    }
    if (type.endsWith("/*")) {
      return fileType.startsWith(type.replace("/*", ""));
    }
    return fileType === type;
  });

  if (!matches) {
    return {
      errorKey: FileDropzoneErrorCode.INVALID_FILE_TYPE,
      value: {
        fileName: file.name,
        message: translate(
          "file-upload.extension-rejected-extended",
          file.name,
          acceptFileTypes,
        ),
      },
    };
  }
  return null;
};
