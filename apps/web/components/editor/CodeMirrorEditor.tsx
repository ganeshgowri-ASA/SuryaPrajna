"use client";

import {
  autocompletion,
  closeBrackets,
  closeBracketsKeymap,
  completionKeymap,
} from "@codemirror/autocomplete";
import { defaultKeymap, history, historyKeymap, indentWithTab } from "@codemirror/commands";
import { javascript } from "@codemirror/lang-javascript";
import { markdown } from "@codemirror/lang-markdown";
import {
  bracketMatching,
  defaultHighlightStyle,
  foldGutter,
  foldKeymap,
  indentOnInput,
  syntaxHighlighting,
} from "@codemirror/language";
import { highlightSelectionMatches, openSearchPanel, searchKeymap } from "@codemirror/search";
import { EditorState } from "@codemirror/state";
import { oneDark } from "@codemirror/theme-one-dark";
import {
  EditorView,
  crosshairCursor,
  drawSelection,
  dropCursor,
  highlightActiveLine,
  highlightActiveLineGutter,
  highlightSpecialChars,
  keymap,
  lineNumbers,
  rectangularSelection,
} from "@codemirror/view";
import { forwardRef, useCallback, useEffect, useImperativeHandle, useRef } from "react";

export interface CodeMirrorEditorHandle {
  insertAtCursor: (text: string) => void;
  replaceSelection: (text: string) => void;
  getSelectedText: () => string;
    scrollToLine?: (line: number) => void;
}

interface CodeMirrorEditorProps {
  content: string;
  onChange: (content: string) => void;
  mode: "markdown" | "latex";
  onCursorChange?: (line: number, col: number) => void;
  onSelectionChange?: (text: string) => void;
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

const CodeMirrorEditor = forwardRef<CodeMirrorEditorHandle, CodeMirrorEditorProps>(
  function CodeMirrorEditor({ content, onChange, mode, onCursorChange, onSelectionChange }, ref) {
    const containerRef = useRef<HTMLDivElement>(null);
    const viewRef = useRef<EditorView | null>(null);
    const onChangeRef = useRef(onChange);
    const onCursorChangeRef = useRef(onCursorChange);
    const onSelectionChangeRef = useRef(onSelectionChange);

    onChangeRef.current = onChange;
    onCursorChangeRef.current = onCursorChange;
    onSelectionChangeRef.current = onSelectionChange;

    useImperativeHandle(ref, () => ({
      insertAtCursor(text: string) {
        const view = viewRef.current;
        if (!view) return;
        const pos = view.state.selection.main.head;
        view.dispatch({
          changes: { from: pos, insert: text },
          selection: { anchor: pos + text.length },
        });
        view.focus();
      },
      replaceSelection(text: string) {
        const view = viewRef.current;
        if (!view) return;
        const { from, to } = view.state.selection.main;
        view.dispatch({
          changes: { from, to, insert: text },
          selection: { anchor: from + text.length },
        });
        view.focus();
      },
      getSelectedText() {
        const view = viewRef.current;
        if (!view) return "";
        const { from, to } = view.state.selection.main;
        return view.state.sliceDoc(from, to);
      },
    }));

    const getLanguageExtension = useCallback(() => {
      if (mode === "latex") {
        // Use JavaScript mode for LaTeX-like highlighting (better than nothing)
        return javascript();
      }
      return markdown();
    }, [mode]);

    // biome-ignore lint/correctness/useExhaustiveDependencies: intentionally runs once on mount only
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
          const { from, to } = update.state.selection.main;
          const selText = from !== to ? update.state.sliceDoc(from, to) : "";
          onSelectionChangeRef.current?.(selText);
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
    // biome-ignore lint/correctness/useExhaustiveDependencies: mode drives language reconfiguration
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
              const { from, to } = update.state.selection.main;
              const selText = from !== to ? update.state.sliceDoc(from, to) : "";
              onSelectionChangeRef.current?.(selText);
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
    }, [mode]);

    return (
      <div
        ref={containerRef}
        className="h-full w-full overflow-auto [&_.cm-editor]:h-full [&_.cm-scroller]:overflow-auto"
      />
    );
  },
);

export default CodeMirrorEditor;
