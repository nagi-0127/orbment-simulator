import { solve } from 'yalps'
import type { Model, Solution, Coefficients } from 'yalps'

/**
 * Pointオブジェクト取得(全属性0で初期化)
 * @returns Point
 */
export const getZeroPoint = (): Point => {
  return {
    EARTH: 0,
    WATER: 0,
    FIRE: 0,
    WIND: 0,
    TIME: 0,
    SKY: 0,
    MIRAGE: 0
  }
}

/**
 * 
 * @param targetList 
 * @returns 
 */
export const getMaximumPoint = (targetList: BaseSkillQuarz[]): Point => {
  const ret: Point = getZeroPoint()
  const keys = Object.keys(ret) as (keyof Point)[]
  targetList.forEach(t => {
    keys.forEach(k => {
      ret[k] = Math.max(t.point[k], ret[k])
    })
  })
  return ret
}

/**
 * Pointm文字列変換
 * @param p Point
 * @returns text
 */
export const getPointString = (p: Point): string => {
  return `地：${p.EARTH} 水：${p.WATER} 火：${p.FIRE} 風：${p.WIND} 時：${p.TIME} 空：${p.SKY} 幻：${p.MIRAGE}`
}


const pointMultiply = (point: Point, mul: number = 2): Point => {
  return {
    EARTH: point.EARTH * mul,
    WATER: point.WATER * mul,
    FIRE: point.FIRE * mul,
    WIND: point.WIND * mul,
    TIME: point.TIME * mul,
    SKY: point.SKY * mul,
    MIRAGE: point.MIRAGE * mul
  }
}

export const pointAdd = (a: Point, b: Point): Point => {
  return {
    EARTH: a.EARTH + b.EARTH,
    WATER: a.WATER + b.WATER,
    FIRE: a.FIRE + b.FIRE,
    WIND: a.WIND + b.WIND,
    TIME: a.TIME + b.TIME,
    SKY: a.SKY + b.SKY,
    MIRAGE: a.MIRAGE + b.MIRAGE,
  }
}

const getQuartzListFromResult = (result: object, slots: Slot[], validQuartz: Quartz[]): (Quartz | null)[] => {
  // 検索結果をスロット位置（属性専用の場合は位置固定, それ以外は-1）, クオーツIDに分解
  const idSet = Object.keys(result)
    .filter(k => k.startsWith('slot_'))
    .map(id => {
      const [_, pos, qid] = id.split('_')
      return [parseInt(pos), parseInt(qid)]
    })
  const resultQuartz: (Quartz | null)[] = []
  slots.forEach(slot => {
    if (slot.typeSpecified) {
      const id = idSet.filter(([p, _]) => p === slot.position)?.[0]
      if (id) {
        idSet.splice(idSet.indexOf(id), 1)
        const quartz: Quartz = validQuartz.filter(val => val.id == id[1])[0]
        resultQuartz.push({
          ...quartz,
          // ポイント2倍
          point: pointMultiply(quartz.point)
        })
      } else {
        resultQuartz.push(null)
      }
    } else {
      const id = idSet.filter(([p, _]) => p === -1)?.[0]
      if (id) {
        idSet.splice(idSet.indexOf(id), 1)
        const quartz: Quartz = validQuartz.filter(val => val.id == id[1])[0]
        resultQuartz.push({
          ...quartz,
        })
      } else {
        resultQuartz.push(null)
      }
    }
  })
  return resultQuartz
}

/**
 * ソルバーに渡すModelを生成
 * @param character 対象キャラクター
 * @param selectedSkills 選択スキル
 * @param selectedQuartz 選択クオーツ
 * @returns Model
 */
export const getModel = (character: Character, selectedSkills: { [key in Lines]: { requiredPoint: Point, selected: Skill[] } }, selectedQuartz: Quartz[]): Model => {
  const lineInfo = { ...character.orbment }

  const variables: { [key: string]: { [key: string]: any } } = {}
  const constraints: { [key: string]: any } = {}
  const ints: { [key: string]: any } = {}

  // 実験 目的変数に最大化対象のポイントの加重平均を設定してみる
  const weights: { [key: string]: number } = {}
  // 必要ポイントを制約条件に追加
  for (const [line, { requiredPoint, selected }] of Object.entries(selectedSkills)) {
    // 検索スキルが選択されていないラインはスキップ
    if (selected.length == 0) {
      continue
    }
    for (const [type, point] of Object.entries(requiredPoint)) {
      if (point !== 0) {
        constraints[`${line}_${type}`] = { min: point }
      }
      // 検証 整数のほうが早い?
      weights[`${line}_${type}`] = point
    }
  }

  const varKeysAll: string[] = []

  for (const line of Object.keys(lineInfo)) {
    if (selectedSkills[line as Lines].selected.length == 0) {
      // 検索スキルが選択されていないラインはスキップ
      continue
    }
    const slots = lineInfo[line as Lines]
    // 属性専用以外のスロット数
    const n_non_type_slot = slots.filter(s => !s.typeSpecified).length
    // 属性専用スロット数
    const n_type_slot = slots.filter(s => s.typeSpecified).length
    // ラインにセット可能クオーツ
    const lineValidQuartz = selectedQuartz.filter(quartz => {
      return quartz.line.includes(line as Lines)
    })
    // セット可能な個数はスロット数まで
    constraints[line] = { max: n_non_type_slot }

    for (const quartz of lineValidQuartz) {
      const quartzId = `Q${quartz.id}`
      const linePoint = Object.fromEntries(Object.entries(quartz.point).map(([k, v]) => [`${line}_${k}`, v]))
      const total = Object.entries(linePoint).reduce((sum, [k, v]) => {
        return sum + v * (weights[k] ?? 0)
      }, 0)
      if (total === 0) {
        // 探索対象のスキルのポイントを持たないクオーツは変数に加えない
        continue
      }

      const variable = {
        [quartzId]: 1,
        [line]: 1,
        ...linePoint,
        total: total,
        n: 1
      }
      variables[`${line}_-1_${quartz.id}`] = variable
      Object.keys(variable).forEach(k => {
        if (!varKeysAll.includes(k)) {
          varKeysAll.push(k)
        }
      })
    }

    if (n_type_slot > 0) {
      for (const slot of slots.filter(s => s.typeSpecified)) {
        const typeValidQuartz = lineValidQuartz.filter(quartz => slot.type.includes(quartz.type))
        constraints[`${line}_${slot.position}`] = { max: 1 }
        for (const quartz of typeValidQuartz) {
          const quartzId = `Q${quartz.id}`
          const linePoint = Object.fromEntries(Object.entries(pointMultiply(quartz.point, 2)).map(([k, v]) => [`${line}_${k}`, v]))
          const total = Object.entries(linePoint).reduce((sum, [k, v]) => {
            return sum + v * (weights[k] ?? 0)
          }, 0)
          if (total === 0) {
            // 探索対象のスキルのポイントを持たないクオーツは変数に加えない
            continue
          }

          const variable = {
            [quartzId]: 1,
            [`${line}_${slot.position}`]: 1,
            ...linePoint,
            total: total === 0 ? 100 : total,
            n: 1
          }

          variables[`${line}_${slot.position}_${quartz.id}`] = variable
          Object.keys(variable).forEach(k => {
            if (!varKeysAll.includes(k)) {
              varKeysAll.push(k)
            }
          })
        }
      }
    }
  }

  for (const variableName of Object.keys(variables)) {
    ints[variableName] = true
  }

  selectedQuartz.forEach(quartz => {
    const quartzId = `Q${quartz.id}`
    // 同じクオーツが複数変数に存在する場合のみ制約に加える
    if (Object.values(variables).filter(v => quartzId in v).length > 1) {
      // 同じクオーツを使用できるのは1回まで
      constraints[quartzId] = { max: 1 }
    }
  })

  // 各変数に存在しないキーをすべて0で追加(変数オブジェクトが全て同じ型でないと遅い...気がする)
  const dummy = Object.fromEntries(varKeysAll.map(k => [k, 0]))
  const model: Model = {
    objective: 'total',
    // direction: 'minimize',
    variables: Object.fromEntries(
      Object.entries(variables).map(([k, v]) => [k, { ...dummy, ...v }])
    ),
    constraints,
    // ints
    binaries: true
  }
  return model
}


export const parseSolution = (solution: Solution, character: Character, selectedQuartz: Quartz[]): { [key in Lines]?: (Quartz | null)[] } => {
  const resultVal: { [key in Lines]?: (Quartz | null)[] } = {}
  for (const line of Object.keys(character.orbment)) {
    // 検索結果をスロット位置（属性専用の場合は位置固定, それ以外は-1）, クオーツIDに分解
    const idSet = solution.variables
      .filter(([k]) => k.startsWith(line))
      .map(([id]) => {
        const [_, pos, qid] = id.split('_')
        return [parseInt(pos), parseInt(qid)]
      })

    const quartzList: (Quartz | null)[] = []
    character.orbment[line as Lines].forEach(slot => {
      if (slot.typeSpecified) {
        const id = idSet.filter(([p, _]) => p === slot.position)?.[0]
        if (id) {
          idSet.splice(idSet.indexOf(id), 1)
          const quartz: Quartz = selectedQuartz.filter(val => val.id == id[1])[0]
          quartzList.push({
            ...quartz,
            // ポイント2倍
            point: pointMultiply(quartz.point)
          })
        } else {
          quartzList.push(null)
        }
      } else {
        const id = idSet.filter(([p, _]) => p === -1)?.[0]
        if (id) {
          idSet.splice(idSet.indexOf(id), 1)
          const quartz: Quartz = selectedQuartz.filter(val => val.id == id[1])[0]
          quartzList.push({
            ...quartz,
          })
        } else {
          quartzList.push(null)
        }
      }
    })
    resultVal[line as Lines] = quartzList
  }
  return resultVal
}


/**
 * クオーツ組み合わせ検索
 * @param character 対象キャラクター
 * @param selectedSkills 選択スキル
 * @param selectedQuartz 選択クオーツ
 * @param n 検索最大件数
 * @returns 検索結果
 */
export const searchQuartz = (character: Character, selectedSkills: { [key in Lines]: { requiredPoint: Point, selected: Skill[] } }, selectedQuartz: Quartz[], n: number = 1): ReadableStream<{ [key in Lines]?: (Quartz | null)[] }> => {
  let model = getModel(character, selectedSkills, selectedQuartz)

  const worker: Worker = new Worker(new URL('@/util/solverWorker.ts', import.meta.url), { type: 'module' })
  const stream = new ReadableStream<{ [key in Lines]?: (Quartz | null)[] } >({
    start(controller) {
      let counter = 0;
      worker.onmessage = (ev: MessageEvent<Solution>) => {
        console.log(ev.data)
        if (ev.data.status === 'optimal') {
          controller.enqueue(parseSolution(ev.data, character, selectedQuartz))
          if (++counter >= n) {
            worker.terminate();
            controller.close();
            return
          }

          // 同じ組み合わせを除外する制約を追加
          const idList = ev.data.variables.map(([k]) => k)
          const variables = { ...model.variables } as { [x: string]: { [name: string]: number } }
          for (const varName in variables) {
            variables[varName][`pattern${counter}`] = idList.includes(varName) ? 1 : 0
          }
          const constraints = { ...model.constraints } as { [x: string]: { [name: string]: number } }
          constraints[`pattern${counter}`] = { max: ev.data.variables.length - 1 }

          model = {
            ...model,
            variables,
            constraints
          }
          // 再検索
          worker.postMessage(model)
        } else {
          worker.terminate();
          controller.close();
          return
        }
      }
      worker.postMessage(model);
    },
    cancel() {
      worker.terminate()
    }
  })

  return stream
}