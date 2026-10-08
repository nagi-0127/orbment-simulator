type MenuTitle = {
  id: number;
  name: string;
  to: string;
}

type Types = 'EARTH' | 'WATER' | 'FIRE' | 'WIND' | 'TIME' | 'SKY' | 'MIRAGE'
type Lines = 'WEAPON' | 'SHIELD' | 'DRIVE' | 'EXTRA'

type Point = {
  EARTH: number;
  WATER: number;
  FIRE: number;
  WIND: number;
  TIME: number;
  SKY: number;
  MIRAGE: number;
}

interface BaseQuarz {
  id: number;
  name: string;
  type: Types;
  description: string;
  point: Point;
}

interface BaseSkill {
  id: number;
  name: string;
  description: string;
  point: Point;
}

interface Skill extends BaseSkill {
  line: Lines;
}

interface Quartz extends BaseQuarz {
  line: Lines[];
}

type Slot = {
  position: number;
  type: Types[];
  typeSpecified: boolean;
}

type Orbment = {
  [key in Lines]: Slot[]
}

type Character = {
  id: number;
  name: string;
  orbment: Orbment;
}

type SlotSora = {
  line: number;
  no: number;
  type: Types | null;
}

type CharacterSora = {
  id: number;
  name: string;
  slots: SlotSora[]
}

/** 【空】同系統クオーツのグループ */
type QuartzGroupSora = 'DEF' | 'STUN' | 'ATS' | 'HP' | 'STR' | 'CRT' | 'ADF' | 'ESC' | 'SPD' | 'INC' | 'HIT' | 'SAVEP' | 'JAM' | 'EP';

type QuartzSora = BaseSkillQuarz & {
  type: Types;
  group: QuartzGroupSora[];
}