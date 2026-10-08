import type { Model, Constraint } from "yalps"
import { lessEq, equalTo } from "yalps"
import { quartzGroupSora } from "@/const/contants"

const SHARED_SLOT_LINE = 0
const M = 100

/**
 * 制約条件となる必要ポイントを精査する。
 * @param selectedArts 
 * @returns 
 */
const getConstraintsPoint = (selectedArts: BaseQuarz[]): Point[] => {
  const points: Point[] = selectedArts.map(a => a.point);
  console.log(points)
  const filteredPoints: Point[] = [];

  points.forEach((point) => {
    // 同一条件が抽出済みの場合スキップ
    const idx = filteredPoints.findIndex(p => {
      return Object.keys(point).reduce((prev, key) => {
        return prev && (p[key as keyof Point] === point[key as keyof Point])
      }, true)
    })
    if (idx > 0) return;

    // 対象ポイントの中で最大の場合条件追加
    const existsGreater = points.reduce((prev, value) => {
      if (prev) return prev;

      const existsGreater = Object.keys(point).reduce((flag, key) => {
        return flag && (point[key as keyof Point] <= value[key as keyof Point])
      }, true)
      
      return prev &&
       existsGreater
    }, false)

    if (!existsGreater) {
      filteredPoints.push(point)
    }
  })

  return filteredPoints;
}

/**
 * ソルバーに渡すModelを生成
 * @param {CharacterSora} character
 * @param {BaseQuarz[]} selectedArts
 * @param {QuartzSora[]} selectedQuartz
 * @param {QuartzSora[]} requiredQuartz
 */
export const getModel = (character: CharacterSora, selectedArts: BaseQuarz[], selectedQuartz: QuartzSora[], requiredQuartz: QuartzSora[]): Model => {
  const variables: { [key: string]: { [key: string]: any } } = {}
  const constraints: { [key: string]: Constraint } = {}
  const integers: string[] = []
  const binaries: string[] = []

  // 変数、制約の前処理
  const groupKeys = Object.keys(quartzGroupSora) as QuartzGroupSora[];

  const quartzList: ({
    [key in string]: string | number | Point;
  })[] = selectedQuartz.map(quartz => {
    const groupParam = Object.fromEntries(groupKeys.map(key => {
      // クオーツが含まれるグループを1に設定
      const group = quartzGroupSora[key];
      return [`GROUP_${key}`, quartz.group.includes(group) ? 1 : 0];
    }))
    const idKey = `QID_${quartz.id}`
    if (requiredQuartz.map(q => q.id).includes(quartz.id)) {
      // 必須指定がある場合には必ず選出する制約
      constraints[idKey] = equalTo(1);
    } else {
      // 同じクオーツは複数セット不可の制約
      constraints[idKey] = lessEq(1);
    }
    return {
      id: quartz.id,
      type: quartz.type,
      [idKey]: 1,
      ...groupParam,
      point: quartz.point,
    }
  });

  groupKeys.forEach(key => {
    // 同グループの最大数は1の制約
    constraints[`GROUP_${key}`] = lessEq(1);
  });

  // スロットごとにセット可能なクオーツを全て変数に設定する。
  const numLines = Math.max(...character.slots.map(slot => slot.line));
  character.slots.forEach(slot => {
    const validQuartz = quartzList.filter(q => slot.type === null || slot.type === q.type);
    validQuartz.forEach(quartz => {
      // lineごとにpoint変数設定
      const linePoints: {
        [key in string]: string | number;
      } = {};
      for (let i = 0; i < numLines; i++) {
        Object.entries(quartz.point).forEach(([key, point]) => {
          // line番号が同じ、または 0 (共通)の場合にポイントセット。
          linePoints[`${key}_${i}`] = ((i + 1) === slot.line || slot.line === SHARED_SLOT_LINE) ? point : 0;
        })
      }
      const variable = { ...quartz, ...linePoints };

      const slotKey = `${slot.line}_${slot.no}`;
      const varKey = `${slotKey}_${quartz.id}`;
      character.slots.forEach(_slot => {
        const _slotKey = `${_slot.line}_${_slot.no}`;
        // 対象のスロットを1に設定
        variable[_slotKey] = _slotKey === slotKey ? 1 : 0;
      });
      variables[varKey] = variable;
      // 変数のバイナリ制約
      binaries.push(varKey);
    })
  });

  character.slots.forEach(slot => {
    // 1スロット1クオーツ以下の制約
    const slotKey = `${slot.line}_${slot.no}`;
    constraints[slotKey] = lessEq(1);
  });

  const targetPoints = getConstraintsPoint(selectedArts);

  console.log(targetPoints)

  return {
    variables,
    constraints,
    integers,
    binaries,
  }
}
