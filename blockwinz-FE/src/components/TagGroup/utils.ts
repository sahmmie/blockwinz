import { TagGroupItem } from "./TagGroup"

export const getNewTagGroupItem = (result: number, isWin: boolean): TagGroupItem => {
  return {
    color: isWin ? '#151832' : '#ECF0F1',
    bgColor: isWin ? '#00DD25' : '#545463',
    label: result.toFixed(2),
    id: Math.random().toString(),
  }
}