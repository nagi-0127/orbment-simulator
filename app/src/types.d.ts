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

interface BaseSkillQuarz {
  id: number;
  name: string;
  description: string;
  point: Point;
}

interface Skill extends BaseSkillQuarz {
  line: Lines;
}

interface Quartz extends BaseSkillQuarz {
  type: Types;
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
