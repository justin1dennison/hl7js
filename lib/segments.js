const { InvalidArgumentError } = require('./errors')
const isArray = require('lodash/isArray')
const isNil = require('lodash/isNil')
const isEmpty = require('lodash/isEmpty')
const random = require('lodash/random')
const formatDate = require('date-fns/format')

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
   * @throws {InvalidArgumentError} Argument name must be a valid name
   */
  constructor(name, fields = null) {
    if (!name || name.length !== 3 || name.toUpperCase() !== name) {
      throw new InvalidArgumentError(
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
    if (!end) end = this.fields.length
    return this.fields.slice(start, end + 1)
  }

  /**
   * @returns {number} size of the segment based on fields
   */
  size() {
    return this.fields.length - 1
  }
}

class MSH extends Segment {
  /**
   *
   * @param {null|array} fields
   * @param {null|array} hl7Globals
   * @throws InvalidArgumentError
   * @throws Error
   */
  constructor(fields = null, globals = null) {
    super('MSH', fields)
    if (!isNil(fields)) {
      if (!isArray(globals)) {
        this.setField(1, '|')
        this.setField(2, '^!\\&')
        this.setField(7, formatDate(new Date(), 'yyyymmddHHMMSS'))

        this.setField(10, `${this.getField(7)}${random(10000, 99999)}`)
        this.setField(12, '2.3')
      } else {
        const {
          FIELD_SEPARATOR,
          COMPONENT_SEPARATOR,
          REPETITION_SEPARATOR,
          ESCAPE_CHARACTER,
          SUBCOMPONENT_SEPARATOR,
          HL7_VERSION
        } = globals
        this.setField(1, FIELD_SEPARATOR)
        this.setField(
          2,
          `${COMPONENT_SEPARATOR}${REPETITION_SEPARATOR}${ESCAPE_CHARACTER}${SUBCOMPONENT_SEPARATOR}`
        )
        this.setField(7, formatDate(new Date(), 'yyyymmddHHMMSS'))

        this.setField(10, `${this.getField(7)}${random(10000, 99999)}`)
        this.setField(12, HL7_VERSION)
      }
    }
  }

  /**
   *
   * @param {number} index
   * @param {string} value
   * @returns {boolean}
   */
  setField(index, value = '') {
    if (index === 1) {
      if (value.length !== 1) {
        return false
      }
    }
    if (index === 2) {
      if (value.length !== 4) {
        return false
      }
    }

    return super.setField(index, value)
  }

  setSendingApplication(value, position = 3) {
    return this.setField(position, value)
  }

  setSendingFacility(value, position = 4) {
    return this.setField(position, value)
  }

  setReceivingApplication(value, position = 5) {
    return this.setField(position, value)
  }

  setReceivingFacility(value, position = 6) {
    return this.setField(position, value)
  }

  setDateTimeOfMessage(value, position = 7) {
    return this.setField(position, value)
  }

  setSecurity(value, position = 8) {
    return this.setField(position, value)
  }

  /**
   * Sets message type to MSH segment
   *
   * If trigger event is already set, then it is preserved.
   * @param {string} value
   * @param {number} position
   * @return {boolean}
   */
  setMessageType(value, position = 9) {
    const type = this.getField(position)
    if (isArray(type) && !isEmpty(type[1])) {
      value = [value, type[1]]
    }
    return this.setField(position, value)
  }

  /**
   *
   * @param {string} value
   * @param {number} position
   * @returns {boolean}
   */
  setTriggerEvent(value, position = 9) {
    const type = this.getField(position)
    if (isArray(type) && !isEmpty(type[0])) {
      value = [type[0], value]
    } else {
      value = [type, value]
    }
    return this.setField(position, value)
  }

  setMessageControlId(value, position = 10) {
    return this.setField(position, value)
  }

  setProcessingId(value, position = 11) {
    return this.setField(position, value)
  }

  setVersionId(value, position = 12) {
    return this.setField(position, value)
  }

  setSequenceNumber(value, position = 13) {
    return this.setField(position, value)
  }

  setContinuationPointer(value, position = 14) {
    return this.setField(position, value)
  }

  setAcceptAcknowledgementType(value, position = 15) {
    return this.setField(position, value)
  }

  setApplicationAckowledgementType(value, position = 16) {
    return this.setField(position, value)
  }

  setCountryCode(value, position = 17) {
    return this.setField(position, value)
  }

  setCharacterSet(value, position = 18) {
    return this.setField(position, value)
  }

  setPrincipalLanguage(value, position = 19) {
    return this.setField(position, value)
  }

  getSendingApplication(position = 13) {
    return this.getField(position)
  }

  getSendingFacility(position = 4) {
    return this.getField(position)
  }

  getReceivingApplication(position = 5) {
    return this.getField(position)
  }

  getReceivingFacility(position = 6) {
    return this.getField(position)
  }

  getDateTimeOfMessage(position = 7) {
    return this.getField(position)
  }

  getMessageType(position = 9) {
    const type = this.getField(9)
    if (!isEmpty(type) && isArray(type)) {
      return type[0]
    }
    return type
  }

  getTriggerEvent(position = 9) {
    field = this.getField(position)
    if (!isEmpty(field[1]) && isArray(field)) {
      return field[1]
    }
    return false
  }

  getMessageControlId(position = 10) {
    return this.getField(position)
  }

  getProcessingId(position = 10) {
    return this.getField(position)
  }

  getVersionId(position = 12) {
    return this.getField(position)
  }
}

module.exports = {
  Segment,
  MSH
}
