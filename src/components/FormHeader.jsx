import { useState, useEffect } from "react";
import { getAppWindow } from "../tauri-utils";

export default function FormHeader() {
  const appWindow = getAppWindow();
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      const scrollPosition = window.scrollY;
      setIsScrolled(scrollPosition > 50);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <header
      data-tauri-drag-region
      className={`form-header ${isScrolled ? "scrolled" : ""}`}
    >
      <div
        data-tauri-drag-region
        className={`titleBarBtns ${isScrolled ? "no-rounded" : ""}`}
      >
        {isScrolled && (
          <p data-tauri-drag-region className="h-scrolled">
            Golestan API
          </p>
        )}
        <div
          className={`button-container ${
            isScrolled ? "button-container-nor" : ""
          }`}
        >
          <button
            className={`topBtn minimizeBtn ${isScrolled ? "topBtn-nor" : ""}`}
            onClick={() => appWindow.minimize()}
          ></button>
          <button
            className={`topBtn closeBtn ${isScrolled ? "topBtn-nor" : ""}`}
            onClick={() => appWindow.close()}
          >
            x
          </button>
        </div>
      </div>
      <h2 data-tauri-drag-region>Golestan API</h2>
      <p data-tauri-drag-region className="subtitle">
        Configure your service parameters below
      </p>
    </header>
  );
}
