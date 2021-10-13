import * as R from 'ramda'
import { isObj } from './isWhat'
import { AF, AO } from './index'

/**
 * @description 数组分类
 * @return object
  */
export const classifyAos = R.curry(
  (prop: AF, arr: AO[]) =>
    arr.reduce((r, o) => {
      const v = prop(o)
      r[v] = r[v] ? [...r[v], o] : [o]
      return r
    }, {} as AO)
)

/**
 * @description 二维只取数组中某一项（忽略空值）， 输入 undefined | null 取全部值
  */
export const flatArrayShallow = R.curry(
  (index: number | undefined | null, arr: any[]) =>
    arr.reduce((r, c) => {
      const isAll = c == undefined
      const v = isAll ? c : c?.[index!]
      return v !== undefined ? [...r, ...isAll && Array.isArray(v) ? v : [v]] : r
    }, [] as any[])
)

export const propLength = R.prop('length') as AF

/** 
 * @description 数据内销
  */
export const uniqueWith = R.curry(
  (choose: AF, prop_: string | AF, arr: any[]) => {
    const prop = typeof prop_ === 'function' ? prop_ : d => d?.[prop_]
    const arrMap = arr.reduce((map, cur) => {
      const key = cur && typeof cur === 'object' ? prop(cur) : cur
      map.set(key, map.has(key) ? choose(map.get(key), cur) : cur)
      return map
    }, new Map())

    return Array.from(arrMap.values())
  }
)

/**
 * @description 优先返回左边，遇到object则合并
  */
export const uniqueLeft = uniqueWith((a, b) => isObj(a) && isObj(b) ? { ...b, ...a } : a)

/**
 * @description 优先返回右边, 遇到object则合并
  */
export const uniqueRight = uniqueWith((b, a) => isObj(a) && isObj(b) ? { ...b, ...a } : a)

export const sortByProp: AF = R.curry(
  (prop_: Key, arr: any[]) => {
    const prop = typeof prop_ === 'function' ? prop_ : v => v?.[prop_]
    const newArr = [...arr]

    return newArr.sort((a, b) => prop(a) - prop(b))
  }
)

/** 
 * @description 更新数组某一项的值
 */
export const setArr: AF = R.curry(
  (arr: any[], index: number, newV): any[] =>
    newV === arr[index] ? arr : [...arr.slice(0, index), newV, ...arr.slice(index + 1)]
)

export const arrMove = R.curry(
  (origin: number, target: number, arr: any[]) =>
    [...arr.slice(0, origin), ...arr.slice(origin + 1, target + 1), arr[origin], ...arr.slice(target + 1)]
)

export const mergeArrayWith = R.curry(
  (chonse: AF<[any, any], any>, arr1: any[], arr2: []) => {
    const max = Math.max(arr1.length, arr2.length)
    const r: any[] = []
    for (let i = 0; i < max; i++) {
      let raceValue: any

      switch (true) {
        case Array.isArray(arr1[i]) && Array.isArray(arr2):
          raceValue = mergeArrayWith(chonse, arr1[i], arr2[i])
          break

        case arr1.length <= i:
          raceValue = arr2[i]
          break

        case arr2.length <= i:
          raceValue = arr1[i]
          break

        default: raceValue = chonse(arr1[i], arr2[i])
      }
      r.push(raceValue)
    }
    return r
  }
)