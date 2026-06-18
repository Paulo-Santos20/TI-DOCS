import { useEffect, useRef } from 'react'
import { createEditor, LexicalEditor as LexicalEditorType } from 'lexical'
import { $generateHtmlFromNodes, $generateNodesFromDOM } from '@lexical/html'

interface Props {
  contentJson: any
}

export default function LexicalViewer({ contentJson }: Props) {
  const containerRef = useRef<HTMLDivElement>(null)
  const editorRef = useRef<LexicalEditorType | null>(null)

  useEffect(() => {
    if (!containerRef.current || !contentJson) return

    if (!editorRef.current) {
      editorRef.current = createEditor({
        namespace: 'tidocs-viewer',
        onError: (e) => console.error(e),
        editable: false,
      })
    }

    const editor = editorRef.current
    const container = containerRef.current

    if (contentJson.root) {
      try {
        const editorState = editor.parseEditorState(JSON.stringify(contentJson))
        editor.setEditorState(editorState)
        editor.update(() => {
          const html = $generateHtmlFromNodes(editor)
          container.innerHTML = html
        })
      } catch {
        if (contentJson.text) container.textContent = contentJson.text
        else container.textContent = JSON.stringify(contentJson, null, 2)
      }
    } else if (contentJson.text) {
      container.textContent = contentJson.text
    } else {
      container.textContent = JSON.stringify(contentJson, null, 2)
    }
  }, [contentJson])

  return (
    <div ref={containerRef} className="text-slate-700 prose prose-sm max-w-none min-h-[200px]" />
  )
}
