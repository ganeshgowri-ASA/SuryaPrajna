"use client";

import { useEffect, useRef, useCallback } from "react";
import { EditorState } from "@codemirror/state";
import { EditorView, keymap, lineNumbers, highlightActiveLineGutter, highlightSpecialChars, drawSelection, dropCursor, rectangularSelection, crosshairCursor, highlightActiveLine } from "@codemirror/view";
import { defaultKeymap, history, historyKeymap, indentWithTab } from "@codemirror/commands";
import { markdown } from "@codemirror/lang-markdown";
import { javascript } from "@codemirror/lang-javascript";
import { searchKeymap, highlightSelectionMatches, openSearchPanel } from "@codemirror/search";
import { autocompletion, completionKeymap, closeBrackets, closeBracketsKeymap } from "@codemirror/autocomplete";
import { indentOnInput, bracketMatching, foldGutter, foldKeymap, syntaxHighlighting, defaultHighlightStyle } from "@codemirror/language";
import { oneDark } from "@codemirror/theme-one-dark";

interface CodeMirrorEditorProps {
  content: string;
  onChange: (content: string) => void;
  mode: "markdown" | "latex";
  onCursorChange?: (line: number, col: number) => void;
}

const solarTheme = EditorView.theme({
  "&": {
    backgroundColor: "transparent",
    color: "#e5e7eb",
    height: "100%",
  },
  ".cm-content": {
    fontFamily: "'JetBrains Mono', 'Fira Code', monospace",
    fontSize: "14px",
    lineHeight: "1.6",
    caretColor: "#f59e0b",
    padding: "8px 0",
  },
  "&.cm-focused .cm-cursor": {
    borderLeftColor: "#f59e0b",
  },
  ".cm-gutters": {
    backgroundColor: "rgba(17, 17, 27, 0.8)",
    color: "#4b5563",
    border: "none",
    borderRight: "1px solid rgba(55, 65, 81, 0.4)",
  },
  ".cm-activeLineGutter": {
    backgroundColor: "rgba(245, 158, 11, 0.08)",
    color: "#f59e0b",
  },
  ".cm-activeLine": {
    backgroundColor: "rgba(245, 158, 11, 0.04)",
  },
  ".cm-selectionBackground": {
    backgroundColor: "rgba(245, 158, 11, 0.15) !important",
  },
  "&.cm-focused .cm-selectionBackground": {
    backgroundColor: "rgba(245, 158, 11, 0.2) !important",
  },
  ".cm-searchMatch": {
    backgroundColor: "rgba(245, 158, 11, 0.3)",
  },
  ".cm-foldGutter": {
    color: "#4b5563",
  },
  ".cm-tooltip": {
    backgroundColor: "#1f2937",
    border: "1px solid #374151",
    color: "#e5e7eb",
  },
  ".cm-tooltip-autocomplete": {
    "& > ul > li[aria-selected]": {
      backgroundColor: "rgba(245, 158, 11, 0.15)",
    },
  },
  ".cm-panels": {
    backgroundColor: "#111827",
    color: "#e5e7eb",
  },
  ".cm-panel.cm-search": {
    backgroundColor: "#111827",
  },
  ".cm-panel.cm-search input": {
    backgroundColor: "#1f2937",
    color: "#e5e7eb",
    border: "1px solid #374151",
  },
  ".cm-panel.cm-search button": {
    backgroundColor: "#374151",
    color: "#e5e7eb",
  },
});

export default function CodeMirrorEditor({
  content,
  onChange,
  mode,
  onCursorChange,
}: CodeMirrorEditorProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const viewRef = useRef<EditorView | null>(null);
  const onChangeRef = useRef(onChange);
  const onCursorChangeRef = useRef(onCursorChange);

  onChangeRef.current = onChange;
  onCursorChangeRef.current = onCursorChange;

  const getLanguageExtension = useCallback(() => {
    if (mode === "latex") {
      // Use JavaScript mode for LaTeX-like highlighting (better than nothing)
      return javascript();
    }
    return markdown();
  }, [mode]);

  useEffect(() => {
    if (!containerRef.current) return;

    const updateListener = EditorView.updateListener.of((update) => {
      if (update.docChanged) {
        onChangeRef.current(update.state.doc.toString());
      }
      if (update.selectionSet) {
        const pos = update.state.selection.main.head;
        const line = update.state.doc.lineAt(pos);
        onCursorChangeRef.current?.(line.number, pos - line.from + 1);
      }
    });

    const customKeymap = keymap.of([
      {
        key: "Mod-s",
        run: () => {
          // Trigger save - handled by parent via auto-save
          return true;
        },
      },
      {
        key: "Mod-f",
        run: (view) => {
          openSearchPanel(view);
          return true;
        },
      },
    ]);

    const state = EditorState.create({
      doc: content,
      extensions: [
        lineNumbers(),
        highlightActiveLineGutter(),
        highlightSpecialChars(),
        history(),
        foldGutter(),
        drawSelection(),
        dropCursor(),
        EditorState.allowMultipleSelections.of(true),
        indentOnInput(),
        bracketMatching(),
        closeBrackets(),
        autocompletion(),
        rectangularSelection(),
        crosshairCursor(),
        highlightActiveLine(),
        highlightSelectionMatches(),
        keymap.of([
          ...closeBracketsKeymap,
          ...defaultKeymap,
          ...searchKeymap,
          ...historyKeymap,
          ...foldKeymap,
          ...completionKeymap,
          indentWithTab,
        ]),
        getLanguageExtension(),
        oneDark,
        solarTheme,
        syntaxHighlighting(defaultHighlightStyle, { fallback: true }),
        updateListener,
        customKeymap,
        EditorView.lineWrapping,
      ],
    });

    const view = new EditorView({
      state,
      parent: containerRef.current,
    });

    viewRef.current = view;

    return () => {
      view.destroy();
      viewRef.current = null;
    };
    // Only create the editor once on mount
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Sync content from parent (only if it diverges from editor)
  useEffect(() => {
    const view = viewRef.current;
    if (!view) return;
    const currentContent = view.state.doc.toString();
    if (currentContent !== content) {
      view.dispatch({
        changes: { from: 0, to: currentContent.length, insert: content },
      });
    }
  }, [content]);

  // Rebuild language extension when mode changes
  useEffect(() => {
    const view = viewRef.current;
    if (!view) return;

    // Reconfigure by dispatching a new state
    const currentContent = view.state.doc.toString();
    const newState = EditorState.create({
      doc: currentContent,
      extensions: [
        lineNumbers(),
        highlightActiveLineGutter(),
        highlightSpecialChars(),
        history(),
        foldGutter(),
        drawSelection(),
        dropCursor(),
        EditorState.allowMultipleSelections.of(true),
        indentOnInput(),
        bracketMatching(),
        closeBrackets(),
        autocompletion(),
        rectangularSelection(),
        crosshairCursor(),
        highlightActiveLine(),
        highlightSelectionMatches(),
        keymap.of([
          ...closeBracketsKeymap,
          ...defaultKeymap,
          ...searchKeymap,
          ...historyKeymap,
          ...foldKeymap,
          ...completionKeymap,
          indentWithTab,
        ]),
        getLanguageExtension(),
        oneDark,
        solarTheme,
        syntaxHighlighting(defaultHighlightStyle, { fallback: true }),
        EditorView.updateListener.of((update) => {
          if (update.docChanged) {
            onChangeRef.current(update.state.doc.toString());
          }
          if (update.selectionSet) {
            const pos = update.state.selection.main.head;
            const line = update.state.doc.lineAt(pos);
            onCursorChangeRef.current?.(line.number, pos - line.from + 1);
          }
        }),
        keymap.of([
          {
            key: "Mod-s",
            run: () => true,
          },
        ]),
        EditorView.lineWrapping,
      ],
    });
    view.setState(newState);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mode]);

  return (
    <div
      ref={containerRef}
      className="h-full w-full overflow-auto [&_.cm-editor]:h-full [&_.cm-scroller]:overflow-auto"
    />
  );
}
