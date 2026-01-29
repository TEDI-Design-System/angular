import { Injectable, Signal, signal } from "@angular/core";
import { FileDropzone, FileInputMode } from "./types";

@Injectable()
export class FileService {
  mode = signal<FileInputMode>("append").asReadonly();

  protected _files = signal<FileDropzone[]>([]);

  get files(): Signal<FileDropzone[]> {
    return this._files.asReadonly();
  }

  public async addFiles(files: FileDropzone[] | File[]): Promise<void> {
    let newFiles = this.normalizeFiles(files);
    const currentFiles = this.files();

    switch (this.mode()) {
      case "append": {
        // index any duplicate name file
        newFiles = await this._renameDuplicates(currentFiles, newFiles);
        break;
      }

      case "replace": {
        // replace any files with the same name
        const filesToCheck = [...currentFiles, ...newFiles];
        const duplicateFiles = filesToCheck.filter(
          (file, index, self) =>
            self.findIndex((f) => f.name === file.name) !== index
        );
        if (duplicateFiles.length > 0) {
          newFiles = newFiles.filter(
            (file) => !duplicateFiles.some((f) => f.name === file.name)
          );
        }
        break;
      }
    }
    newFiles.push(...currentFiles);

    // remove old invalid files, fileStatus will not yet be set for new files
    newFiles = newFiles.filter((file) => file.fileStatus !== "invalid");

    this._files.set(newFiles);
  }

  public normalizeFiles(files: FileDropzone[] | File[]): FileDropzone[] {
    if (!files || files.length === 0) {
      return [];
    }
    const newFiles = files.map((file) => {
      if (file instanceof FileDropzone) {
        return file;
      }
      if (file instanceof File) {
        return new FileDropzone(file as File);
      }
      throw new Error("Invalid file type provided to addFiles");
    });
    return newFiles;
  }

  public async removeFiles(files: FileDropzone[]): Promise<void> {
    if (!files || files.length === 0) {
      return;
    }
    const newFiles = this.files().filter((file) => !files.includes(file));
    this._files.set(newFiles);
  }

  private async _renameDuplicates(
    currentFiles: FileDropzone[],
    newFiles: FileDropzone[]
  ): Promise<FileDropzone[]> {
    const renamedFiles: FileDropzone[] = [];
    const fileNames = new Set(
      currentFiles.map((file) => file.name.toLowerCase())
    );

    for (const file of newFiles) {
      const maxCounter = 1000;
      let newName = file.name;
      let counter = 1;

      while (fileNames.has(newName.toLowerCase()) && counter < maxCounter) {
        // the .extension part of the file name unfortunately
        const [fileName, ...rest] = file.name.split(".");
        newName = `${fileName} (${counter}).${rest.join(".")}`;
        counter++;
      }

      fileNames.add(newName.toLowerCase());
      renamedFiles.push(await this._copyFile(file.file, newName));
    }
    return renamedFiles;
  }

  private _copyFile(original: File, newName?: string): Promise<FileDropzone> {
    return original.arrayBuffer().then((buffer) => {
      const file = new File([buffer], newName ?? original.name, {
        type: original.type,
        lastModified: original.lastModified,
      });
      return new FileDropzone(file);
    });
  }
}
