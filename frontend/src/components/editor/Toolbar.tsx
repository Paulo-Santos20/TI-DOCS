import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext'
import { $getSelection, $isRangeSelection, FORMAT_TEXT_COMMAND, FORMAT_ELEMENT_COMMAND } from 'lexical'
import { $createHeadingNode, $isHeadingNode, HeadingTagType } from '@lexical/rich-text'
import { $setBlocksType } from '@lexical/selection'
import { INSERT_ORDERED_LIST_COMMAND, INSERT_UNORDERED_LIST_COMMAND } from '@lexical/list'
import { useEffect, useState } from 'react'

export default function Toolbar() {
  const [editor] = useLexicalComposerContext()
  const [isBold, setIsBold] = useState(false)
  const [isItalic, setIsItalic] = useState(false)

  useEffect(() => {
    return editor.registerUpdateListener(({ editorState }) => {
      editorState.read(() => {
        const sel = $getSelection()
        if ($isRangeSelection(sel)) {
          setIsBold(sel.hasFormat('bold'))
          setIsItalic(sel.hasFormat('italic'))
        }
      })
    })
  }, [editor])

  const btnClass = (active: boolean) =>
    `p-2 rounded-lg text-sm transition-colors ${active ? 'bg-clinical-100 text-clinical-700' : 'text-slate-500 hover:bg-slate-100'}`

  const setHeading = (tag: string) => {
    editor.update(() => {
      const sel = $getSelection()
      if (sel) {
        if (tag === 'p') $setBlocksType(sel, () => ({ exportJSON: () => ({}) } as any))
        else $setBlocksType(sel, () => $createHeadingNode(tag as HeadingTagType))
      }
    })
  }

  return (
    <div className="flex items-center gap-1 p-2 border-b border-slate-200 bg-white flex-wrap">
      <button onClick={() => editor.dispatchCommand(FORMAT_TEXT_COMMAND, 'bold')}
        className={btnClass(isBold)} title="Negrito"><strong>B</strong></button>
      <button onClick={() => editor.dispatchCommand(FORMAT_TEXT_COMMAND, 'italic')}
        className={btnClass(isItalic)} title="Itálico"><em>I</em></button>
      <span className="w-px h-5 bg-slate-200 mx-1" />
      <button onClick={() => editor.dispatchCommand(FORMAT_ELEMENT_COMMAND, 'left')}
        className={btnClass(false)} title="Alinhar">≡</button>
      <span className="w-px h-5 bg-slate-200 mx-1" />
      <button onClick={() => editor.dispatchCommand(INSERT_UNORDERED_LIST_COMMAND, undefined)}
        className={btnClass(false)} title="Lista">•</button>
      <button onClick={() => editor.dispatchCommand(INSERT_ORDERED_LIST_COMMAND, undefined)}
        className={btnClass(false)} title="Lista numerada">1.</button>
      <span className="w-px h-5 bg-slate-200 mx-1" />
      <select onChange={(e) => setHeading(e.target.value)}
        className="text-xs px-2 py-1.5 rounded-lg border border-slate-200 bg-white text-slate-600 outline-none">
        <option value="">Estilo</option>
        <option value="h1">Título 1</option>
        <option value="h2">Título 2</option>
        <option value="h3">Título 3</option>
      </select>
    </div>
  )
}
