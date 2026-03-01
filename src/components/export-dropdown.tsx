import { CopyButton } from "./copy-button";
import { Image, Download } from "lucide-react";
import { ActionButton } from "./action-button";

interface ExportDropdownProps {
  onCopy: () => void;
  onDownloadCode: () => void;
  lastGenerated: Date;
  onExportImage: () => void;
  isOpen: boolean;
}

export function ExportDropdown({
  onCopy,
  onDownloadCode,
  lastGenerated,
  onExportImage,
}: ExportDropdownProps) {
  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:gap-4">
        <ActionButton
          onClick={onExportImage}
          icon={Image}
          tooltipText="Download diagram as high-quality PNG"
          text="Download PNG"
        />
        <ActionButton
          onClick={onDownloadCode}
          icon={Download}
          tooltipText="Download Mermaid.js source code as .mmd file"
          text="Download Code"
        />
        <CopyButton onClick={onCopy} />
      </div>

      <div className="flex items-center">
        <span className="text-sm text-gray-700 dark:text-neutral-300">
          Last generated: {lastGenerated.toLocaleString()}
        </span>
      </div>
    </div>
  );
}
