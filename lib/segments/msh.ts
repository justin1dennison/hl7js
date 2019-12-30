import isArray from 'lodash/isArray'
import isObject from 'lodash/isObject'
import isNil from 'lodash/isNil'
import isEmpty from 'lodash/isEmpty'
import random from 'lodash/random'
import formatDate from 'date-fns/format'
import { Segment } from './base'
import { HL7Globals, Field } from '../types'

export class MSH extends Segment {
  /**
   *
   * @param {null|array} fields
   * @param {null|array} globals 
   * @throws InvalidArgumentError
   * @throws Error
   */
  constructor(fields = null, globals?: HL7Globals) {
    super('MSH', fields)
    if (!isNil(fields)) {
      if (!isObject(globals)) {
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
  setField(index: number, value: Field = ''): boolean {
    if (index === 1) {
      if (value && value.length !== 1) {
        return false
      }
    }
    if (index === 2) {
      if (value && value.length !== 4) {
        return false
      }
    }

    return super.setField(index, value)
  }

  setSendingApplication(value: Field, position = 3): boolean | Field | Field[] {
    return this.setField(position, value)
  }

  setSendingFacility(value: Field, position = 4) {
    return this.setField(position, value)
  }

  setReceivingApplication(value: Field, position = 5) {
    return this.setField(position, value)
  }

  setReceivingFacility(value: Field, position = 6) {
    return this.setField(position, value)
  }

  setDateTimeOfMessage(value: Field, position = 7) {
    return this.setField(position, value)
  }

  setSecurity(value: Field, position = 8) {
    return this.setField(position, value)
  }

  /**
   * Sets message type to MSH segment
   *
   * If trigger event is already set, then it is preserved.
   * @param {Field} value
   * @param {number} position
   * @return {boolean}
   */
  setMessageType(value: Field, position = 9) {
    const type = this.getField(position)
    if (isArray(type) && !isEmpty(type[1])) {
      value = [value as Field, type[1] as Field] as Field
    }
    return this.setField(position, value)
  }

  /**
   *
   * @param {string} value
   * @param {number} position
   * @returns {boolean}
   */
  setTriggerEvent(value: Field | Field[], position = 9) {
    const type = this.getField(position)
    if (isArray(type) && !isEmpty(type[0])) {
      value = [type[0], value as Field]
    } else {
      value = [type as Field, value as Field]
    }
    return this.setField(position, value as Field)
  }

  setMessageControlId(value: Field, position = 10) {
    return this.setField(position, value)
  }

  setProcessingId(value: Field, position = 11) {
    return this.setField(position, value)
  }

  setVersionId(value: Field, position = 12) {
    return this.setField(position, value)
  }

  setSequenceNumber(value: Field, position = 13) {
    return this.setField(position, value)
  }

  setContinuationPointer(value: Field, position = 14) {
    return this.setField(position, value)
  }

  setAcceptAcknowledgementType(value: Field, position = 15) {
    return this.setField(position, value)
  }

  setApplicationAckowledgementType(value: Field, position = 16) {
    return this.setField(position, value)
  }

  setCountryCode(value: Field, position = 17) {
    return this.setField(position, value)
  }

  setCharacterSet(value: Field, position = 18) {
    return this.setField(position, value)
  }

  setPrincipalLanguage(value: Field, position = 19) {
    return this.setField(position, value)
  }

  getSendingApplication(position = 13): Field {
    return this.getField(position) as Field
  }

  getSendingFacility(position = 4): Field {
    return this.getField(position) as Field
  }

  getReceivingApplication(position = 5): Field {
    return this.getField(position) as Field
  }

  getReceivingFacility(position = 6): Field {
    return this.getField(position) as Field
  }

  getDateTimeOfMessage(position = 7): Field {
    return this.getField(position) as Field
  }

  getMessageType(position = 9): Field {
    const type = this.getField(position)
    if (!isEmpty(type) && isArray(type)) {
      return type[0]
    }
    return type as Field
  }

  getTriggerEvent(position = 9): Field {
    const field = this.getField(position)
    if (isArray(field) && !isEmpty(field[1])) {
      return field[1]
    }
    return ''
  }

  getMessageControlId(position = 10): Field {
    return this.getField(position) as Field
  }

  getProcessingId(position = 10): Field {
    return this.getField(position) as Field
  }

  getVersionId(position = 12): Field {
    return this.getField(position) as Field
  }
}

