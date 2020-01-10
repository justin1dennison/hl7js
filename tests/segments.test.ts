import test from 'ava'
import { Segment } from '../lib/segments'
import isArray from 'lodash/isArray'

test('segment throws error if name is not 3 characters in length and capitalized', t => {
  t.throws(() => new Segment('yyy'))
  t.throws(() => new Segment('YW'))
})

test('field at a given nonzero index can be set', t => {
  const segment = new Segment('XXX')
  segment.setField(1, 'YYY')
  t.is(segment.getField(1), 'YYY', 'Field 1 is YYYY')
})

test('field at index 0 can not be changed', t => {
  const segment = new Segment('XXX')
  segment.setField(0, 'YYY')
  t.not(segment.getField(0), 'YYY', 'Field 0 has not been changed')
  t.is(segment.getField(0), 'XXX', 'Field 0 is still the same')
  t.is(segment.getName(), 'XXX', 'Segment name is still the same')
})

test('a segment can be constructed from an array', t => {
  const segment = new Segment('XXX', ['a', 'b', 'c', ['p', 'q', 'r'], 'd'])
  t.is(segment.getField(3), 'c')
  t.deepEqual(segment.getField(4), ['p', 'q', 'r'])
})

test('field can be set to null', t => {
  const segment = new Segment('XXX')
  segment.setField(1, null)
  t.is(segment.getField(1), null, 'HL7 NULL value')
})

test('field can be set using array', t => {
  const segment = new Segment('XXX')
  segment.setField(3, ['1', '2', '3'])
  t.true(isArray(segment.getField(3)), 'Composed field 1^2^3')
  t.deepEqual(
    segment.getField(3),
    ['1', '2', '3'],
    'Getting array from composed field'
  )
})

test('fields from a given position to end can be retrieved in an array', t => {
  const segment = new Segment('XXX')
  segment.setField(8, 'aaa')
  t.is(segment.getFields(2).length, 7, 'Getting all fields from 2nd index')
})

test('a chunk of fields can be retrieved from a segment', t => {
  const segment = new Segment('XXX')
  segment.setField(8, 'aaa')
  t.is(segment.getFields(2, 4).length, 3, 'Getting fields from 2 till 4')
})

test('setting field beyond last index creates empty fields in between', t => {
  const segment = new Segment('XXX')
  segment.setField(8, 'aaa')
  t.is(segment.getFields().length, 9, 'Number of fields in segment')
})

test('total size of a segment can be obtained', t => {
  const segment = new Segment('XXX')
  segment.setField(8, [''])
  t.is(segment.size(), 8, 'Size operator')
  segment.setField(12, 'x')
  t.is(segment.size(), 12, 'Size operator')
})
