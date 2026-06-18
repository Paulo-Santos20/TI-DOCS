import { LexicalComposer } from '@lexical/react/LexicalComposer'
import { RichTextPlugin } from '@lexical/react/LexicalRichTextPlugin'
import { ContentEditable } from '@lexical/react/LexicalContentEditable'
import { HistoryPlugin } from '@lexical/react/LexicalHistoryPlugin'
import { ListPlugin } from '@lexical/react/LexicalListPlugin'
import { LinkPlugin } from '@lexical/react/LexicalLinkPlugin'
import { LexicalErrorBoundary } from '@lexical/react/LexicalErrorBoundary'
import Toolbar from './Toolbar'

interface Props {
  initialJson?: any
  onChange?: (json: any, html: string) => void
  placeholder?: string
}

const theme = {
  ltr: 'text-left',
  rtl: 'text-right',
  paragraph: 'mb-2',
  heading: {
    h1: 'text-2xl font-bold mb-3',
    h2: 'text-xl font-bold mb-2',
    h3: 'text-lg font-semibold mb-2',
  },
  list: {
    ul: 'list-disc ml-6 mb-2',
    ol: 'list-decimal ml-6 mb-2',
  },
  link: 'text-blue-600 underline',
}

function onError(e: Error) { console.error(e) }

export default function LexicalEditor({ initialJson, onChange, placeholder = 'Digite o conteúdo...' }: Props) {
  const initialConfig = {
    namespace: 'tidocs',
    theme,
    onError,
    editorState: initialJson && initialJson.root ? JSON.stringify(initialJson) : undefined,
  }

  return (
    <div className="border border-slate-200 rounded-xl overflow-hidden">
      <LexicalComposer initialConfig={initialConfig}>
        <Toolbar />
        <div className="relative">
          <RichTextPlugin
            contentEditable={<ContentEditable className="px-4 py-3 min-h-[300px] outline-none text-slate-700 prose prose-sm max-w-none" />}
            placeholder={<div className="absolute top-3 left-4 text-slate-400 pointer-events-none">{placeholder}</div>}
            ErrorBoundary={LexicalErrorBoundary}
          />
          <HistoryPlugin />
          <ListPlugin />
          <LinkPlugin />
        </div>
      </LexicalComposer>
    </div>
  )
}
