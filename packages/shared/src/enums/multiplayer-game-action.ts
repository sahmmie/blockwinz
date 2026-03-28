/** JSON `action` field in `gameAction` payloads (plugin-specific). */
export enum MultiplayerGamePayloadAction {
  MOVE = 'move',
  /** Voluntary resign; opponent wins stakes per settlement rules. */
  FORFEIT = 'forfeit',
}
