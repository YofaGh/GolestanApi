import { getCurrentWindow } from "@tauri-apps/api/window";
import { invoke as tauriInvoke } from "@tauri-apps/api/core";
import {
  readTextFile,
  writeTextFile,
  BaseDirectory,
} from "@tauri-apps/plugin-fs";

export const getAppWindow = () => getCurrentWindow();

export const invoke = async (fn, args) => await tauriInvoke(fn, args);

export const readFile = async (path) =>
  JSON.parse(
    await readTextFile(path, { baseDir: BaseDirectory.AppData }, "utf8")
  );

export const writeFile = async (path, data) =>
  await writeTextFile(
    path,
    JSON.stringify(data, null, 2),
    { baseDir: BaseDirectory.AppData },
    "utf8"
  );
