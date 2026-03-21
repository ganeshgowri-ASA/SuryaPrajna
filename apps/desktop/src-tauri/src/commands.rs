use serde::{Deserialize, Serialize};
use std::fs;
use std::path::PathBuf;
use std::process::Command;

#[derive(Debug, Serialize, Deserialize)]
pub struct CsvRecord {
    pub headers: Vec<String>,
    pub rows: Vec<Vec<String>>,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct PythonResult {
    pub stdout: String,
    pub stderr: String,
    pub exit_code: i32,
}

/// Open a PV data file and return its contents as a string.
#[tauri::command]
pub async fn open_pv_file(path: String) -> Result<String, String> {
    let file_path = PathBuf::from(&path);
    if !file_path.exists() {
        return Err(format!("File not found: {}", path));
    }

    let extension = file_path
        .extension()
        .and_then(|e| e.to_str())
        .unwrap_or("")
        .to_lowercase();

    match extension.as_str() {
        "csv" | "json" | "txt" => {
            fs::read_to_string(&file_path).map_err(|e| format!("Failed to read file: {}", e))
        }
        "xlsx" | "xls" => read_excel_file(&file_path),
        _ => Err(format!("Unsupported file type: {}", extension)),
    }
}

/// Save a report string to the given path.
#[tauri::command]
pub async fn save_report(path: String, content: String) -> Result<(), String> {
    fs::write(&path, &content).map_err(|e| format!("Failed to save report: {}", e))
}

/// Read a CSV file and return structured data.
#[tauri::command]
pub async fn read_csv_data(path: String) -> Result<CsvRecord, String> {
    let mut reader =
        csv::Reader::from_path(&path).map_err(|e| format!("Failed to open CSV: {}", e))?;

    let headers: Vec<String> = reader
        .headers()
        .map_err(|e| format!("Failed to read headers: {}", e))?
        .iter()
        .map(|h| h.to_string())
        .collect();

    let mut rows = Vec::new();
    for result in reader.records() {
        let record = result.map_err(|e| format!("Failed to read row: {}", e))?;
        rows.push(record.iter().map(|f| f.to_string()).collect());
    }

    Ok(CsvRecord { headers, rows })
}

/// Read a JSON file and return its contents.
#[tauri::command]
pub async fn read_json_data(path: String) -> Result<serde_json::Value, String> {
    let content =
        fs::read_to_string(&path).map_err(|e| format!("Failed to read JSON file: {}", e))?;
    serde_json::from_str(&content).map_err(|e| format!("Failed to parse JSON: {}", e))
}

/// Run a Python script and return stdout/stderr.
#[tauri::command]
pub async fn run_python_script(script_path: String, args: Vec<String>) -> Result<PythonResult, String> {
    let output = Command::new("python3")
        .arg(&script_path)
        .args(&args)
        .output()
        .map_err(|e| format!("Failed to execute Python: {}", e))?;

    Ok(PythonResult {
        stdout: String::from_utf8_lossy(&output.stdout).to_string(),
        stderr: String::from_utf8_lossy(&output.stderr).to_string(),
        exit_code: output.status.code().unwrap_or(-1),
    })
}

fn read_excel_file(path: &PathBuf) -> Result<String, String> {
    use calamine::{open_workbook, Reader, Xlsx};

    let mut workbook: Xlsx<_> =
        open_workbook(path).map_err(|e| format!("Failed to open Excel file: {}", e))?;

    let sheet_names = workbook.sheet_names().to_vec();
    let first_sheet = sheet_names
        .first()
        .ok_or("No sheets found in workbook")?
        .clone();

    let range = workbook
        .worksheet_range(&first_sheet)
        .map_err(|e| format!("Failed to read sheet: {}", e))?;

    let mut rows = Vec::new();
    for row in range.rows() {
        let cells: Vec<String> = row.iter().map(|c| c.to_string()).collect();
        rows.push(cells.join(","));
    }

    Ok(rows.join("\n"))
}
