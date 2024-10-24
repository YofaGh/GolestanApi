import { getCurrentWindow } from "@tauri-apps/api/window";

export function TopBar() {
  const appWindow = getCurrentWindow();

  return (
    <div data-tauri-drag-region className="mainApp">
      <div data-tauri-drag-region className="topBar">
        <div data-tauri-drag-region className="titleBarText">
          <div data-tauri-drag-region className="titleText">
            Golestan API
          </div>
        </div>
        <div className="titleBarBtns">
          <button className="topBtn minimizeBtn" onClick={() => appWindow.minimize()}>
            <img alt="" className="icon-t" src="./assets/minimize.svg" />
          </button>
          <button className="topBtn closeBtn" onClick={() => appWindow.close()}>
            <img alt="" className="icon-t" src="./assets/delete.svg" />
          </button>
        </div>
      </div>
    </div>
  );
}
