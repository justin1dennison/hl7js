export type Name = string
export type Field = string | string[] | null
export type HL7Globals = {
  FIELD_SEPARATOR: string,
  SEGMENT_SEPARATOR?: string,
  SEGMENT_ENDING_BAR?: boolean,
  COMPONENT_SEPARATOR: string,
  REPETITION_SEPARATOR: string,
  ESCAPE_CHARACTER: string,
  SUBCOMPONENT_SEPARATOR: string,
  HL7_VERSION: string
}
export type None = undefined | null
export type Some<T> = T
export type Option<T> = Some<T> | None