#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

mod commands;
mod tray;

fn main() {
    tauri::Builder::default()
        .plugin(tauri_plugin_dialog::init())
        .plugin(tauri_plugin_fs::init())
        .plugin(tauri_plugin_shell::init())
        .setup(|app| {
            tray::create_tray(app)?;
            Ok(())
        })
        .invoke_handler(tauri::generate_handler![
            commands::open_pv_file,
            commands::save_report,
            commands::read_csv_data,
            commands::read_json_data,
            commands::run_python_script,
        ])
        .run(tauri::generate_context!())
        .expect("error while running SuryaPrajna desktop");
}
