import { invoke } from "@tauri-apps/api/core";

export interface CsvRecord {
  headers: string[];
  rows: string[][];
}

export interface PythonResult {
  stdout: string;
  stderr: string;
  exit_code: number;
}

/** Open and read a PV data file (CSV, JSON, Excel). */
export async function openPvFile(path: string): Promise<string> {
  return invoke<string>("open_pv_file", { path });
}

/** Save a report to the local file system. */
export async function saveReport(
  path: string,
  content: string,
): Promise<void> {
  return invoke<void>("save_report", { path, content });
}

/** Read a CSV file and return structured data. */
export async function readCsvData(path: string): Promise<CsvRecord> {
  return invoke<CsvRecord>("read_csv_data", { path });
}

/** Read and parse a JSON data file. */
export async function readJsonData(path: string): Promise<unknown> {
  return invoke<unknown>("read_json_data", { path });
}

/** Execute a Python script with arguments. */
export async function runPythonScript(
  scriptPath: string,
  args: string[] = [],
): Promise<PythonResult> {
  return invoke<PythonResult>("run_python_script", {
    scriptPath,
    args,
  });
}
