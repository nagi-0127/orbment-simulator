import type { Model, Constraint, Solution } from "yalps"
import { lessEq, equalTo, greaterEq } from "yalps"
import { quartzGroupSora, typeList } from "@/const/contants"

const SHARED_SLOT_LINE = 0

const variables = {};
const binaries = [];


/**
 * 制約条件となる必要ポイントを精査する。
 * @param selectedArts 
 * @returns 
 */
const getConstraintsPoint = (selectedArts: BaseQuarz[]): Point[] => {
  const points: Point[] = selectedArts.map(a => a.point);

  return points.filter((point, i) => {
    const keys = Object.keys(point) as (keyof Point)[];

    // 1. 完全重複チェック：自分より前のインデックス(j < i)に全く同じ値が存在する場合は削除
    const isDuplicate = points.some((other, j) => {
      if (j >= i) return false;
      return keys.every(key => other[key] === point[key]);
    });
    if (isDuplicate) return false;

    // 2. 完全上位チェック：自分以外の要素にすべてのキーで自分以上のものが存在するか
    const isDominated = points.some((other, j) => {
      if (i === j) return false;

      // すべてのキーで other が item 以上か
      const isGreaterOrEqual = keys.every(key => (other[key] ?? -Infinity) >= point[key]);

      // 少なくとも1つのキーで other が item を厳密に上回っているか
      const hasStrictlyBetterKey = keys.some(key => (other[key] ?? -Infinity) > point[key]);

      // 同値の場合は自分より前のインデックス(j < i)を優先
      const isStrictlyBetter = hasStrictlyBetterKey || (
        keys.every(key => other[key] === point[key]) && j < i
      );

      return isGreaterOrEqual && isStrictlyBetter;
    });

    return !isDominated;
  });
}

/**
 * ソルバーに渡すModelを生成
 * @param {CharacterSora} character
 * @param {BaseQuarz[]} selectedArts
 * @param {QuartzSora[]} selectedQuartz
 * @param {QuartzSora[]} requiredQuartz
 */
const getModel = (character: CharacterSora, selectedArts: BaseQuarz[], selectedQuartz: QuartzSora[], requiredQuartz: QuartzSora[]): Model => {
  const variables: { [key: string]: { [key: string]: any } } = {}
  const constraints: { [key: string]: Constraint } = {}
  const integers: string[] = []
  const binaries: string[] = []

  // 変数、制約の前処理
  const groupKeys = Object.keys(quartzGroupSora) as QuartzGroupSora[];
  // 制約条件のパレートフロント抽出
  const targetPoints: Point[] = getConstraintsPoint(selectedArts);
  // 制約条件数
  const numConstraintPoint: number = targetPoints.length;
  // ライン数
  const numLines: number = Math.max(...character.slots.map(slot => slot.line));

  groupKeys.forEach(key => {
    // 同系統の最大数は1の制約
    constraints[`GROUP_${key}`] = lessEq(1);
  });

  // 各条件を最低1つのラインが満たす制約 (>= 1)
  for (let i = 0; i < numConstraintPoint; i++) {
    constraints[`cond_${i}_covered`] = greaterEq(1);
  }

  // ラインが各条件を満たすための各次元の評価式 (>= 0)
  for (let i = 1; i <= numLines; i++) {
    for (let j = 0; j < numConstraintPoint; j++) {
      typeList.forEach((key) => {
        constraints[`${key}_L${i}_C${j}`] = greaterEq(0)
      })
    }
  }

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

  // スロットごとにセット可能なクオーツを全て
  // 変数に設定する。
  character.slots.forEach(slot => {
    const validQuartz = quartzList.filter(q => slot.type === null || slot.type === q.type);
    validQuartz.forEach(quartz => {
      // lineごとにpoint変数設定
      const linePoints: {
        [key in string]: string | number;
      } = {};
      // ライン/制約条件ごとに変数セット
      for (let i = 1; i <= numLines; i++) {
        for (let j = 0; j < numConstraintPoint; j++) {
          Object.entries(quartz.point as Point).forEach(([key, point]) => {
            // line番号が同じ、または 0 (共通)のフィールドにポイントセット。
            linePoints[`${key}_L${i}_C${j}`] = (i === slot.line || slot.line === SHARED_SLOT_LINE) ? point : 0;
          })
        }
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

  // ラインごとに必要ポイントを満たしているかの条件設定
  for (let i = 1; i <= numLines; i++) {
    targetPoints.forEach((point, index) => {
      const varName = `L${i}_${index}`;
      binaries.push(varName);

      const v = {
        [`cond_${index}_covered`]: 1,
        ...Object.fromEntries(
          Object.entries(point).map(([key, val]) => {
            return [`${key}_L${i}_C${index}`, -val];
          })
        )
      }

      variables[varName] = v;
    })
  }

  return {
    variables,
    constraints,
    integers,
    binaries,
  }
}

const parseSolution = (solution: Solution, character: CharacterSora, selectedQuartz: QuartzSora[]) => {
  const quartzVars = solution.variables.filter(([val]) => !val.startsWith('L'));
  const ret: (SlotSora & {
    quartz: QuartzSora | null
  })[] = quartzVars.map(([val]) => {
    const [line, no, qid] = val.split('_');
    const slot: SlotSora | undefined = character.slots.find(s => s.line === parseInt(line) && s.no === parseInt(no))
    if (!slot) return;
    return {
      ...slot,
      quartz: selectedQuartz.find(q => q.id === parseInt(qid)) ?? null,
    }
  }).filter(v => !!v)
  return ret
}

/**
 * 
 * @param character 
 * @param selectedArts 
 * @param selectedQuartz 
 * @param requiredQuartz 
 */
export const searchQuartz = (character: CharacterSora, selectedArts: BaseQuarz[], selectedQuartz: QuartzSora[], requiredQuartz: QuartzSora[], n: number = 5) => {
  let model = getModel(character, selectedArts, selectedQuartz, requiredQuartz)
  console.log(model)
  const worker: Worker = new Worker(new URL('@/util/solverWorker.ts', import.meta.url), { type: 'module' })

  const stream = new ReadableStream<(SlotSora & {
    quartz: QuartzSora | null
  })[]>({
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
          const idList = ev.data.variables.filter(([val]) => !val.startsWith('L')).map(([k]) => k);
          const variables = { ...model.variables } as { [x: string]: { [name: string]: number } }
          for (const varName in variables) {
            variables[varName][`pattern${counter}`] = idList.includes(varName) ? 1 : 0
          }
          const constraints = { ...model.constraints } as { [x: string]: { [name: string]: number } }
          constraints[`pattern${counter}`] = { max: idList.length - 1 }

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
  });

  return stream;
}
