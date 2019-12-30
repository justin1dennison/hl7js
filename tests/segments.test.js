const test = require('tape')
const { Segment } = require('../lib/segments.js')
const isArray = require('lodash/isArray')

test('Segment throws error if name is not 3 characters in length and capitalized', t => {
  t.throws(() => new Segment('yyy'))
  t.throws(() => new Segment('YW'))
  t.end()
})

test('Field at a given nonzero index can be set', t => {
  const segment = new Segment('XXX')
  segment.setField(1, 'YYY')
  t.equal(segment.getField(1), 'YYY', 'Field 1 is YYYY')
  t.end()
})

test('Field at index 0 can not be changed', t => {
  const segment = new Segment('XXX')
  segment.setField(0, 'YYY')
  t.notEqual(segment.getField(0), 'YYY', 'Field 0 has not been changed')
  t.equals(segment.getField(0), 'XXX', 'Field 0 is still the same')
  t.equals(segment.getName(), 'XXX', 'Segment name is still the same')
  t.end()
})

test('A segment can be constructed from an array', t => {
  const segment = new Segment('XXX', ['a', 'b', 'c', ['p', 'q', 'r'], 'd'])
  t.equals(segment.getField(3), 'c')
  t.deepEquals(segment.getField(4), ['p', 'q', 'r'])
  t.end()
})

test('Field can be set to null', t => {
  const segment = new Segment('XXX')
  segment.setField(1, null)
  t.is(segment.getField(1), null, 'HL7 NULL value')
  t.end()
})

test('Field can be set using array', t => {
  const segment = new Segment('XXX')
  segment.setField(3, ['1', '2', '3'])
  t.true(isArray(segment.getField(3)), 'Composed field 1^2^3')
  t.equals(segment.getField(3).length, 3, 'Getting composed fields as array')
  t.deepEquals(
    segment.getField(3),
    ['1', '2', '3'],
    'Getting single value from composed field'
  )
  t.end()
})

test('Fields from a given position to end can be retrieved in an array', t => {
  const segment = new Segment('XXX')
  segment.setField(8, 'aaa')
  t.equals(segment.getFields(2).length, 7, 'Getting all fields from 2nd index')
  t.end()
})

test('A chunk of fields can be retrieved from a segment', t => {
  const segment = new Segment('XXX')
  segment.setField(8, 'aaa')
  t.equals(segment.getFields(2, 4).length, 3, 'Getting fields from 2 till 4')
  t.end()
})

test('Setting field beyond last index creates empty fields in between', t => {
  const segment = new Segment('XXX')
  segment.setField(8, 'aaa')
  t.equals(segment.getFields().length, 9, 'Number of fields in segment')
  t.end()
})

test('Total size of a segment can be obtained', t => {
  const segment = new Segment('XXX')
  segment.setField(8, [''])
  t.equals(segment.size(), 8, 'Size operator')
  segment.setField(12, 'x')
  t.equals(segment.size(), 12, 'Size operator')
  t.end()
})
