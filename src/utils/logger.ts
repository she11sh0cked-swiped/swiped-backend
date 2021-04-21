import highlight from 'cli-highlight'

function logger(
  collectionName: string,
  method: string,
  query: unknown,
  doc: unknown
): void {
  const message = `${collectionName}.${method}(${JSON.stringify(
    query,
    null,
    1
  )}, ${JSON.stringify(doc, null, 1)})`
    .split('\n')
    .join(' ')
    .split('  ')
    .join(' ')

  console.log(
    highlight(message, {
      ignoreIllegals: true,
      language: 'JavaScript',
    })
  )
}

export default logger
