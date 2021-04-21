import NodeCache from 'node-cache'

const cache = new NodeCache()

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type TFunction = (...args: any[]) => any

type UnPromisify<T> = T extends Promise<infer U> ? U : T

export async function cachedCall<
  TMethod extends TFunction = TFunction,
  TArgs extends Parameters<TMethod> = Parameters<TMethod>,
  TResponse = UnPromisify<ReturnType<TMethod>>
>(method: TMethod, ...args: TArgs): Promise<TResponse> {
  const cacheKey = JSON.stringify({ args, method: method.name })

  let response = cache.get<TResponse>(cacheKey)

  if (response == null) {
    response = await Promise.resolve<TResponse>(method(...args))
    cache.set(cacheKey, response)
  }

  return response
}

export default cache
