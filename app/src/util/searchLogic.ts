import solver from "@bygdle/javascript-lp-solver"

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

export const pointAdd = (a: Point, b:Point): Point => {
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

/**
 * クオーツ組み合わせ検索
 * @param character 対象キャラクター
 * @param selectedSkills 選択スキル
 * @param selectedQuartz 選択クオーツ
 * @returns 検索結果
 */
export const searchQuartzSet = (character: Character, selectedSkills: { [key in Lines]: { requiredPoint: Point, selected: Skill[] } }, selectedQuartz: Quartz[]): { [key in Lines]?: (Quartz | null)[] }[] | null => {
  const lineInfo = character.orbment

  const variables: { [key: string]: any } = {}
  const constraints: { [key: string]: any } = {}
  const ints: { [key: string]: any } = {}

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
    }
  }

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
      const total = Object.entries(linePoint).reduce((sum, [_, v]) => {
        return sum + v
      }, 0)

      variables[`${line}_-1_${quartz.id}`] = {
        [quartzId]: 1,
        [line]: 1,
        ...linePoint,
        total: total,
        n: 1
      }

      // ints[`${line}_-1_${quartz.id}`] = 1

      if (!(quartzId in constraints)) {
        // 同じクオーツを使用できるのは1回まで
        constraints[quartzId] = { max: 1 }
      }
    }

    if (n_type_slot > 0) {
      for (const slot of slots.filter(s => s.typeSpecified)) {
        const typeValidQuartz = lineValidQuartz.filter(quartz => slot.type.includes(quartz.type))
        constraints[`${line}_${slot.position}`] = { max: 1 }
        for (const quartz of typeValidQuartz) {
          const quartzId = `Q${quartz.id}`
          const linePoint = Object.fromEntries(Object.entries(pointMultiply(quartz.point, 2)).map(([k, v]) => [`${line}_${k}`, v]))
          const total = Object.entries(linePoint).reduce((sum, [_, v]) => {
            return sum + v
          }, 0)

          variables[`${line}_${slot.position}_${quartz.id}`] = {
            [quartzId]: 1,
            [`${line}_${slot.position}`]: 1,
            ...linePoint,
            total: total,
            n: 1
          }

          constraints[`${line}_${slot.position}`] = { max: 1 }

          // ints[`${line}_${slot.position}_${quartz.id}`] = 1
        }
      }
    }
  }
  for (const variableName of Object.keys(variables)) {
    ints[variableName] = 1
  }

  console.log({
    optimize: 'total',
    opType: 'min',
    constraints: constraints,
    variables: variables,
    ints: ints
  })
  console.log({
    constraints_count: Object.entries(constraints).length,
    variables_count: Object.entries(variables).length,
    ints_count: Object.entries(ints).length,
  })
  const result = solver.Solve({
    // 使用するクオーツの総数を最小化
    optimize: 'n',
    opType: 'min',
    constraints: constraints,
    variables: variables,
    ints,
    // binaries: ints,
    options: {
      timeout: 10000
    }
  })
  console.log(result)
  if (result.result && result.feasible) {
    // 解が得られたときのみ戻り値生成
    const resultSet: { [key in Lines]?: (Quartz | null)[] }[] = []
    const resultVal: { [key in Lines]?: (Quartz | null)[] } = {}
    for (const line of Object.keys(lineInfo)) {
      // 検索結果をスロット位置（属性専用の場合は位置固定, それ以外は-1）, クオーツIDに分解
      const idSet = Object.keys(result)
        .filter(k => k.startsWith(line))
        .map(id => {
          const [_, pos, qid] = id.split('_')
          return [parseInt(pos), parseInt(qid)]
        })
      // const quartzList: (Quartz | null)[] = Array(lineInfo[line as Lines].length)
      // quartzList.fill(null)
      const quartzList: (Quartz | null)[] = []
      // セット位置が正の順でソート（属性専用のスロットを先にセットする）
      lineInfo[line as Lines].forEach(slot => {
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
    resultSet.push(resultVal)
    return resultSet
  }
  return null
}


// import characters from '../assets/data/kai/characters.json'
// import skills from '../assets/data/kai/shard_skill.json'
// import quarts from '../assets/data/kai/quartz.json'



// const c: Character[] = characters
// console.log(searchQuartzSet(c[0], {
//   DRIVE: {
//     requiredPoint: {
//       EARTH: 1
//     }
//   }
// }, quarts))