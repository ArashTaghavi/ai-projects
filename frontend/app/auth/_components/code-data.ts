export const codeLines = [
  [{ text: '# Turn an idea into possibility', color: 'text-zinc-200' }],
  [{ text: 'from ', color: 'text-violet-300' }, { text: 'intelligence ', color: 'text-zinc-200' }, { text: 'import ', color: 'text-violet-300' }, { text: 'Model', color: 'text-cyan-200' }],
  [],
  [{ text: 'model = ', color: 'text-zinc-200' }, { text: 'Model', color: 'text-cyan-200' }, { text: '(', color: 'text-zinc-300' }, { text: '"creative"', color: 'text-emerald-200/90' }, { text: ')', color: 'text-zinc-300' }],
  [{ text: 'prompt = ', color: 'text-zinc-200' }, { text: '"Imagine what comes next"', color: 'text-emerald-200/90' }],
  [],
  [{ text: 'response = model.', color: 'text-zinc-200' }, { text: 'generate', color: 'text-violet-300' }, { text: '(prompt)', color: 'text-zinc-200' }],
  [{ text: 'print', color: 'text-violet-300' }, { text: '(response)', color: 'text-zinc-200' }],
]

export const codeLength = codeLines.reduce((length, line) => length + line.reduce((sum, token) => sum + token.text.length, 0) + 1, 0)
export const previewPrompt = 'Imagine what comes next'
export const previewResponse = 'Start with a spark. Explore a new direction. Turn your next idea into something extraordinary.'
export const responseStart = codeLength + 30
export const previewCycleLength = responseStart + previewResponse.length + 85
