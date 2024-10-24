import { getCurrentWindow } from "@tauri-apps/api/window";

export function TopBar() {
  const appWindow = getCurrentWindow();

  const Icon = ({ svgName, className, ...props }) => {
    className = className || "icon";
    return (
      <img
        alt=""
        className={className}
        src={`./assets/${svgName}.svg`}
        {...props}
      />
    );
  };

  return (
    <div data-tauri-drag-region className="mainApp">
      <div data-tauri-drag-region className="topBar">
        <div data-tauri-drag-region className="titleBarText">
          <div data-tauri-drag-region className="titleText">
            Golestan API
          </div>
        </div>
        <div className="titleBarBtns">
          <button
            className="topBtn minimizeBtn"
            onClick={() => appWindow.minimize()}
          >
            <Icon svgName="minimize" className="icon-t" />
          </button>
          <button className="topBtn closeBtn" onClick={() => appWindow.close()}>
            <Icon svgName="delete" className="icon-t" />
          </button>
        </div>
      </div>
    </div>
  );
}
