"use client";

import { useState, useEffect, useCallback } from "react";
import MainCard from "~/components/main-card";
import Loading from "~/components/loading";
import MermaidChart from "~/components/mermaid-diagram";
import { useDiagram } from "~/hooks/useDiagram";
import { ApiKeyDialog } from "~/components/api-key-dialog";
import { ApiKeyButton } from "~/components/api-key-button";
import { useStarReminder } from "~/hooks/useStarReminder";
import { Minimize2 } from "lucide-react";

type RepoPageClientProps = {
  username: string;
  repo: string;
};

export default function RepoPageClient({ username, repo }: RepoPageClientProps) {
  const [zoomingEnabled, setZoomingEnabled] = useState(false);
  const [isMaximized, setIsMaximized] = useState(false);

  useStarReminder();

  const toggleMaximize = useCallback(() => {
    setIsMaximized((prev) => !prev);
  }, []);

  // Close fullscreen on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isMaximized) {
        setIsMaximized(false);
      }
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [isMaximized]);

  const normalizedUsername = username.toLowerCase();
  const normalizedRepo = repo.toLowerCase();

  const {
    diagram,
    error,
    loading,
    lastGenerated,
    cost,
    showApiKeyDialog,
    handleCopy,
    handleApiKeySubmit,
    handleCloseApiKeyDialog,
    handleOpenApiKeyDialog,
    handleExportImage,
    handleRegenerate,
    state,
  } = useDiagram(normalizedUsername, normalizedRepo);

  return (
    <>
      {/* Fullscreen overlay */}
      {isMaximized && diagram && (
        <div className="fixed inset-0 z-50 flex flex-col bg-white dark:bg-[#0d0a19]">
          <div className="flex items-center justify-between border-b-[3px] border-black px-4 py-2 dark:border-black">
            <span className="text-sm font-medium text-black dark:text-neutral-200">
              {normalizedUsername}/{normalizedRepo}
            </span>
            <button
              type="button"
              onClick={toggleMaximize}
              className="flex items-center gap-2 rounded-md border-[3px] border-black px-3 py-1.5 font-medium text-black transition-colors bg-purple-300 hover:bg-purple-400 dark:border-[#2d1d4e] dark:bg-[hsl(var(--neo-subtle-muted))] dark:text-black dark:hover:bg-[hsl(var(--neo-subtle))]"
            >
              <Minimize2 size={16} />
              Exit Fullscreen
            </button>
          </div>
          <div className="flex-1 overflow-auto p-4">
            <MermaidChart chart={diagram} zoomingEnabled={true} isMaximized={true} />
          </div>
        </div>
      )}

      <div className="flex flex-col items-center p-4">
        <div className="flex w-full justify-center pt-8">
          <MainCard
            isHome={false}
            username={normalizedUsername}
            repo={normalizedRepo}
            onCopy={handleCopy}
            lastGenerated={lastGenerated}
            onExportImage={handleExportImage}
            onRegenerate={handleRegenerate}
            zoomingEnabled={zoomingEnabled}
            onZoomToggle={() => setZoomingEnabled((prev) => !prev)}
            loading={loading}
            isMaximized={isMaximized}
            onMaximizeToggle={toggleMaximize}
          />
        </div>
        <div className="mt-8 flex w-full flex-col items-center gap-8">
          {loading ? (
            <Loading
              cost={cost}
              status={state.status}
              message={state.message}
              parserError={state.parserError}
              fixAttempt={state.fixAttempt}
              fixMaxAttempts={state.fixMaxAttempts}
              fixDiagramDraft={state.fixDiagramDraft}
              explanation={state.explanation}
              mapping={state.mapping}
              diagram={state.diagram}
            />
          ) : error || state.error ? (
            <div className="mt-12 text-center">
              <p className="max-w-4xl text-lg font-medium text-red-700 dark:text-red-300">
                {error || state.error}
              </p>
              {state.parserError && (
                <pre className="mx-auto mt-4 max-w-4xl overflow-x-auto whitespace-pre-wrap rounded-md border border-neutral-300 bg-neutral-100 p-4 text-left text-xs text-neutral-800 dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-200">
                  {state.parserError}
                </pre>
              )}
              {(error?.includes("API key") ||
                state.error?.includes("API key")) && (
                <div className="mt-8 flex flex-col items-center gap-2">
                  <ApiKeyButton onClick={handleOpenApiKeyDialog} />
                </div>
              )}
            </div>
          ) : (
            <div className="flex w-full justify-center px-4">
              <MermaidChart chart={diagram} zoomingEnabled={zoomingEnabled} />
            </div>
          )}
        </div>

        <ApiKeyDialog
          isOpen={showApiKeyDialog}
          onClose={handleCloseApiKeyDialog}
          onSubmit={handleApiKeySubmit}
        />
      </div>
    </>
  );
}
