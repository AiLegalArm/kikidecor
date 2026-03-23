import type jsPDF from "jspdf";

/**
 * Save a jsPDF document in a way that works on mobile Safari and all browsers.
 * Falls back from doc.save() to blob + link click to window.open.
 */
export function savePDFCrossPlatform(doc: jsPDF, filename: string): void {
  try {
    const blob = doc.output("blob");
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    a.style.display = "none";
    document.body.appendChild(a);
    a.click();

    // Fallback for iOS Safari: also open in new tab
    const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
    if (isIOS) {
      window.open(url, "_blank");
    }

    setTimeout(() => {
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }, 1000);
  } catch {
    // Ultimate fallback
    doc.save(filename);
  }
}
