/// Starts the aredoko management app.
///
/// # Errors
///
/// Returns an error when Tauri cannot create the window or run the event loop.
pub fn run() -> tauri::Result<()> {
    tauri::Builder::default().run(tauri::generate_context!())
}
