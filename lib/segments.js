const { InvalidArgumentException } = require('./errors')
const isArray = require('lodash/isArray')

const NAME_INDEX = 0

class Segment {
  /**
   * Create a segment.
   *
   * {Insert information}
   *
   * @constructor
   * @param {string} name
   * @param {array} fields
   * @throws {InvalidArgumentException} Argument name must be a valid name
   */
  constructor(name, fields = null) {
    if (!name || name.length !== 3 || name.toUpperCase() !== name) {
      throw new InvalidArgumentException(
        `Segment name ${name} should be 3 characters and in uppercase`
      )
    }
    this.fields = []
    this.fields[NAME_INDEX] = name
    if (isArray(fields)) {
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
  setField(index, value) {
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
   * @param {*} index  Index of the field
   * @returns {null|string|array} The value of the field
   */
  getField(index) {
    return this.fields[index] || null
  }

  /**
   * Get the name of the segment. This is the value at index 0 of fields.
   * 
   * @returns mixed Name of Segment
   */
  getName() {
    return this.fields[NAME_INDEX]
  }

  /**
   * Get fields from a segment 
   * @param {number} start 
   * @param {number} end 
   */
  getFields(start = 0, end = null) {
    if(!end) end = this.fields.length
    return this.fields.slice(start, end + 1)
  }

  /**
   * @returns {number} size of the segment based on fields
   */
  size() {
    return this.fields.length - 1
  }
}

module.exports = {
  Segment
}
