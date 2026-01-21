// 241227 AI实现 将联合类型生成为对应的元组类型
// 在 src\schemas\types\forward.ts 中使用了
type UnionToIntersection<U> =
  (U extends any ? (x: U) => any : never) extends (x: infer R) => any ? R : never
type LastInUnion<U> =
  UnionToIntersection<U extends any ? (x: U) => any : never> extends (x: infer L) => any ? L : never
// 将联合类型生成为对应的元组类型
export type UnionToTuple<U, T extends any[] = []> =
  [U] extends [never]
    ? T
    : UnionToTuple<Exclude<U, LastInUnion<U>>, [LastInUnion<U>, ...T]>

// 获取异步函数的返回值类型
export type PromiseReturnType<T extends (...args: any) => any> = Awaited<ReturnType<T>>
