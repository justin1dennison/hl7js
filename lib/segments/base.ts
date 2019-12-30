import { InvalidArgumentError } from '../errors'
import isArray from 'lodash/isArray'
import isNil from 'lodash/isNil'
import { Name, Field } from '../types'

const NAME_INDEX = 0


export class Segment {
  fields: Field[]
  /**
   * Create a segment.
   *
   * {Insert information}
   *
   * @constructor
   * @param {string} name
   * @param {array} fields
   * @throws {InvalidArgumentError} Argument name must be a valid name
   */
  constructor(name: Name, fields?: Field[] | null) {
    if (!name || name.length !== 3 || name.toUpperCase() !== name) {
      throw new InvalidArgumentError(
        `Segment name ${name} should be 3 characters and in uppercase`
      )
    }
    this.fields = []
    this.fields[NAME_INDEX] = name
    if (!isNil(fields) && isArray(fields)) {
      for (let [index, field] of fields.entries()) {
        this.setField(index + 1, field)
      }
    }
  }
  /**
   * Set field at index.
   *
   * @param {number} index
   * @param {string|array} value
   * @return {boolean}
   */
  setField(index: number, value: Field): boolean {
    if (!(index && value)) {
      return false
    }
    for (let i = this.fields.length; i < index; i += 1) {
      this.fields[i] = ''
    }
    this.fields[index] = value
    return true
  }

  /**
   * Get the field at index.
   *
   * @param {number} index  Index of the field
   * @returns {null|string|array} The value of the field
   */
  getField(index: number): null | Field | Field[] {
    return this.fields[index] || null
  }

  /**
   * Get the name of the segment. This is the value at index 0 of fields.
   *
   * @returns mixed Name of Segment
   */
  getName(): Field {
    return this.fields[NAME_INDEX]
  }

  /**
   * Get fields from a segment
   * @param {number} start
   * @param {number} end
   */
  getFields(start = 0, end?: number): Field[] {
    if (end) {
      return this.fields.slice(start, (end as number) + 1)
    } else {
      return this.fields.slice(start, this.fields.length + 1)
    }
  }

  /**
   * @returns {number} size of the segment based on fields
   */
  size(): number {
    return this.fields.length - 1
  }
}