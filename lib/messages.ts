import { HL7Exception, InvalidArgumentError } from './errors'
import { HL7Globals, Option, Field } from './types'
import { negate, isEmpty, trim, isEqual, isArray, findIndex} from 'lodash'
import { MSH, Segment } from './segments'



export default class Message {
    protected segments: Segment[] = []
    segmentSeparator: string = '\n'
    segmentEndingBar: boolean = true
    fieldSeparator: string = '|'
    componentSeparator: string = '^'
    subcomponentSeparator: string = '&'
    repetitionSeparator: string = '~'
    escapeChar: string = '\\'
    hl7Version: string = '2.3'

    constructor(msg?: string, globals?: HL7Globals | null, emptySubFields: boolean = false, resetIndices: boolean = false, autoincrementIndices: boolean = true) {
        this.segments = []

        if (globals) {
            this.segmentSeparator = globals.SEGMENT_SEPARATOR as string ?? '\n'
            this.segmentEndingBar = globals.SEGMENT_ENDING_BAR as boolean ?? true
            this.fieldSeparator = globals.FIELD_SEPARATOR as string ?? '|'
            this.componentSeparator = globals.COMPONENT_SEPARATOR as string ?? '^'
            this.subcomponentSeparator = globals.SUBCOMPONENT_SEPARATOR as string ?? '&'
            this.repetitionSeparator = globals.REPETITION_SEPARATOR as string ?? '~'
            this.escapeChar = globals.ESCAPE_CHARACTER as string ?? '\\'
            this.hl7Version = globals.HL7_VERSION as string ?? '2.3'
        }

        if (resetIndices) {
            this.resetSegmentIndices()
        }

        if (msg) {
            const sep = new RegExp(`[\n\r${this.segmentSeparator}]`, 'mg')
            const segments = msg.split(sep).filter(negate(isEmpty)).map(trim)
            const controlPattern = /^([A-Z0-9]{3})(.)(.)(.)(.)(.)(.)/
            if (!controlPattern.test(segments[0])) {
                throw new HL7Exception("Not a valid message: invalid control segment")
            }
            const [
                _,
                header,
                fieldSeparator,
                componentSeparator,
                repetitionSeparator,
                escapeChar,
                subcomponentSeparator,
                fieldSeparatorCtrl
            ] = controlPattern.exec(segments[0])

            if (fieldSeparator !== fieldSeparatorCtrl) {
                throw new HL7Exception('Not a valid message: field separator invalid')
            }

            this.fieldSeparator = fieldSeparator
            this.componentSeparator = componentSeparator
            this.subcomponentSeparator = subcomponentSeparator
            this.escapeChar = escapeChar
            this.repetitionSeparator = repetitionSeparator

            for (let [i, segment] of segments.entries()) {
                const fields: Field[] = segment.split(new RegExp(`\\${this.fieldSeparator}`))
                const name = (fields.shift() as string ?? '').toUpperCase()
                for (let [j, field] of fields.entries()) {
                    if (i === 0 && j === 0) continue
                    fields[j] = this.extractComponentsFromFields(field, emptySubFields)
                }
                let seg

                switch (name.toUpperCase()) {
                    case 'MSH':
                        fields.unshift(this.fieldSeparator)
                        seg = new MSH(fields)
                        break;
                    default:
                        seg = new Segment(name, fields)
                        break;
                }

                if (!seg) throw new Error('Segment not created.')

                this.addSegment(seg)
            }
        }
    }

    /**
     * @returns 
     */
    resetSegmentIndices(): void {
        // TODO: implement - requires reflection about the module
    }

    /**
     * 
     * @param field 
     * @param emptySubFields 
     * @returns Components of a field
     */
    extractComponentsFromFields(field: Field, emptySubFields: boolean): any {
        let components: Field[] | Field[][] = (field as string).split(new RegExp(`\\${this.componentSeparator}`))
        if (!emptySubFields) {
            components = components.filter(negate(isEmpty))
        }
        for (let [i, component] of components.entries()) {
            const subcomponents = (component as string).split(new RegExp(`\\${this.subcomponentSeparator}`))
            components[i] = subcomponents.length === 1 ? subcomponents[0] : subcomponents
        }
        return components.length === 1 ? components[0] : components
    }
    /**
     * 
     * @param segment 
     * @returns if the addition of a segment was successful
     */
    addSegment(segment: Segment): boolean {
        if (this.segments.length === 0) {
            this.resetCtrl(segment)
        }
        this.segments.push(segment)
        return true
    }

    insertSegment(segment: Segment, index: number | null = null) {
        const length = this.segments.length
        if (index && index > length) {
            throw new InvalidArgumentError(`Index out of range. Index: ${index}, Total segments: ${length}`)
        }
        if (index && index === 0) {
            this.resetCtrl(segment)
            this.segments.unshift(segment)
        } else if (index === length) {
            this.segments.push(segment)
        } else {
            this.segments = [
                ...this.segments.slice(0, index as number),
                segment,
                ...this.segments.slice(index as number)
            ]
        }
    }

    /**
     * 
     * @param index 
     */
    getSegmentByIndex(index: number): Option<Segment> {
        if (index >= this.segments.length) return null
        return this.segments[index]
    }

    /**
     * 
     * @param segment 
     */
    getSegmentIndex(segment: Segment): Option<number> {
        for (let [i, s] of this.segments.entries()) {
            if (isEqual(s, segment)) return i
        }
        return null
    }

    /**
     * 
     * @param name 
     */
    getSegmentsByName(name: string): Segment[] {
        const segments: Segment[] = []
        for (let segment of this.segments) {
            if (segment.getName() === name) {
                segments.push(segment)
            }
        }
        return segments

    }

    /**
     * 
     * @param index 
     * @returned if the remove was successful
     */
    removeSegmentByIndex(index: number): boolean {
        if (index < this.segments.length) this.segments.splice(index, 1)
        return true
    }

    /**
     * 
     * @param name 
     * @returns the number of segments removed
     */
    removeSegmentsByName(name: string): number {
        let count = 0
        for (let segment of this.getSegmentsByName(name)) {
            this.removeSegmentByIndex(this.getSegmentIndex(segment) as number)
            count += 1
        }
        return count
    }

    /**
     * 
     * @param segment 
     * @param index 
     * @returns if the setting of the segment was successful
     */
    setSegment(segment: Segment, index?: number): boolean {
        if (index || (index && index > this.segments.length)) {
            throw new InvalidArgumentError('Index out of Range')
        }

        if (index === 0 && segment.getName() === 'MSH') {
            this.resetCtrl(segment)
        }

        this.segments[index as number] = segment
        return true
    }


    /**
     * 
     * @param segment 
     * @return success of the resetting control segment
     */
    resetCtrl(segment: Segment): boolean {
        if (segment.getField(1)) {
            this.fieldSeparator = segment.getField(1) as string
        }

        const pattern = /(.)(.)(.)(.)/
        if (pattern.test(segment.getField(2) as string)) {
            const [
                _,
                componentSeparator,
                repetitionSeparator,
                escapeChar,
                subcomponentSeparator
            ] = pattern.exec(segment.getField(2) as string)
            this.componentSeparator = componentSeparator
            this.repetitionSeparator = repetitionSeparator
            this.escapeChar = escapeChar
            this.subcomponentSeparator = subcomponentSeparator
        }
        if (segment.getField(12)) {
            this.hl7Version = segment.getField(12) as string
        }

        return true
    }

    /**
     * @returns segments contained in the message
     */
    getSegments(): Segment[] {
        return this.segments
    }

    /**
     * @returns stringified version of Message
     */
    toString(): string {
        const endingPattern = new RegExp(`\\${this.fieldSeparator}$`)
        if (isEmpty(this.segments)) {
            throw new HL7Exception('Message contains no data. Cannot convert to string')
        }
        this.resetCtrl(this.segments[0])
        let message = '';
        for (let segment of this.segments) {
            let segString: string = this.segmentToString(segment)
            if (!this.segmentEndingBar) {
                segString = segString.replace(endingPattern, '')
            }
            message += segString
            message += this.segmentSeparator
        }

        return message

    }

    segmentToString(segment: Segment): string {
        const name = segment.getName()
        let str = name + this.fieldSeparator
        const fields = segment.getFields(name === 'MSH' ? 2 : 1)
        for (let field of fields) {
            if (isArray(field)) {
                for (let [i, value] of field.entries()) {
                    if (isArray(value)) {
                        str += value.join(this.subcomponentSeparator)
                    } else {
                        str += value
                    }
                    if (i < (field.length - 1)) {
                        str += this.componentSeparator
                    }
                }
            } else {
                str += field
            }

            str += this.fieldSeparator
        }
        return str.replace(new RegExp(`\\${this.fieldSeparator}$`), '')
    }

    /**
     * 
     * @param index 
     * @returns {string|undefined|null}
     */
    getSegmentAsString(index: number): Option<string> {
        const seg = this.getSegmentByIndex(index)
        return seg === null ? seg : this.segmentToString(seg as Segment)
    }

    getSegmentFieldAsString(segIndex: number, fieldIndex: number): Option<string> {
        const seg = this.getSegmentByIndex(segIndex)
        if(!seg) return seg
        const field = seg?.getField(fieldIndex)
        if(!field) return field
        let s = ''
        if(isArray(field)) {
            for(let [i, f] of field.entries()) {
                if(isArray(f)) s += field.join(this.subcomponentSeparator)
                else s += field

                if(i < field.length - 1) s += this.componentSeparator
            }
        } else {
            s += field
        }
        return s
    }

    hasSegment(segment: string): boolean {
        return this.getSegmentsByName(segment.toUpperCase()).length > 0
    }

    getFirstSegmentInstance(segment: string): Option<Segment> {
        if(!this.hasSegment(segment)) return null
        return this.getSegmentsByName(segment)[0]
    }

    removeSegment(segment: Segment, reIndex = false) {
        let i
        if(i = findIndex(this.segments, s => s === segment)) this.segments.splice(i, 1)
        if(reIndex) {
            const segs = this.getSegmentsByName(segment.getName() as string)
            for(let [index, seg] of segs.entries()) {
                seg.setField(1, (index + 1).toString() as Field)
            }
        }

    }

}
