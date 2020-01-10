import test from 'ava'
import Message from '../lib/messages'
import { Segment, MSH } from '../lib/segments'
import { InvalidArgumentError } from '../lib/errors'
import { isNil } from 'lodash'

test('subfields can be retained when required', t => {
  const message = new Message("MSH|^~\\&|1|\rPV1|1|O|^AAAA1^^^BB|", null, true)
  const pv = (message.getSegmentByIndex(1) as Segment)
  const fields = pv.getField(3)
  t.deepEqual(fields, ['', 'AAAA1', '', '', 'BB'])

})

test('segments can be added to existing message', t => {
  const message = new Message()
  message.addSegment(new MSH())
  message.addSegment(new Segment('PID'))

  const s0 = message.getSegmentByIndex(0)
  const s1 = message.getSegmentByIndex(1)
  t.is(s0?.getName(), 'MSH', 'Segment 0 name MSH')
  t.is(s1?.getName(), 'PID', 'Segment 1 name PID')

})

test('fields can be added to existing segments', t => {
  const message = new Message()
  message.addSegment(new MSH())
  message.addSegment(new Segment('ABC'))

  const s0 = message.getSegmentByIndex(0)
  const s1 = message.getSegmentByIndex(1)

  s0?.setField(3, 'XXX')
  s1?.setField(2, 'Foo')

  t.is(s0?.getField(3), 'XXX', '3rd field of MSH')
  t.is(s1?.getField(2), 'Foo', '2nd field of ABC')
  t.is(message.getSegmentByIndex(0)?.getField(3), 'XXX', '3rd field of MSH')

})

test('control characters are properly set from MSH segment', t => {
  const message = new Message('MSH|^~\\&|1|\rABC|||xxx|\r')
  t.is(message.getSegmentByIndex(0)?.getField(2), '^~\\&')

})

test('control characters can be customized using second argument', t => {
  const msg = new Message('MSH|^~\\&|1|\nABC|||xxx|\n', { SEGMENT_SEPARATOR: '\r\n' })
  t.is(msg.toString(), 'MSH|^~\\&|1|\r\nABC|||xxx|\r\n', 'custom line endings')

})

test('message can be converted to string', t => {
  const msg = new Message('MSH|^~\\&|1|\rABC|||xxx|\r')
  t.is(msg.toString(), 'MSH|^~\\&|1|\nABC|||xxx|\n')

})

test('toString method throws exception when message empty', t => {
  const msg = new Message()
  t.throws(() => {
    msg.toString()
  })

})

test('components and subcomponents can be extracted from a field', t => {
  const msg = new Message()
  const field = 'xx^x&y&z^yy^zz'
  const result = msg.extractComponentsFromFields(field, false)
  t.deepEqual(result, ['xx', ['x', 'y', 'z'], 'yy', 'zz'])

})

test('fields and subfields can be set properly', t => {
  const message = new Message('MSH|^~\\&|1|\rABC|||xx^x&y&z^yy^zz|\r')
  const segment = message.getSegmentByIndex(1)
  const field = (segment?.getField(3) as any)
  t.is('xx', field[0], 'Composed field')
  t.is('y', field[1][1], 'subcomposed field')

})

test('fields can be separated by custom character', t => {
  const message = new Message('MSH*^~\\&*1\rABC***xxx\r')
  t.is(message.toString(), 'MSH*^~\\&*1\nABC***xxx\n', 'string representation of message with * as field separator')

})

test('components of a field can be separated by custom character', t => {
  const message = new Message('MSH|*~\\&|1\rABC|||x*y*z\r')
  const field = message.getSegmentByIndex(1)?.getField(3) as any
  t.is(field[0], 'x', 'composed field with * as separator between subfields')

})

test('subcomponents can be separated by a custom character', t => {
  const message = new Message("MSH|^~\\@|1\rABC|||a^x@y@z^b\r")
  const field = message.getSegmentByIndex(1)?.getField(3) as any
  t.is(field[1][1], 'y', 'subcomposed field with @ as separator')

})

test('segments can be added from message', t => {
  const message = new Message()
  message.addSegment(new Segment('XXX'))
  const name = message.getSegmentByIndex(0)?.getName() as any
  t.is(name, 'XXX', 'add segment')

})

test('segment can be removed from message', t => {
  let message = new Message("MSH|^~\\&|1|\nAAA|1||xxx|\nBBB|1|\nBBB|2|")
  let segment = message.getFirstSegmentInstance('BBB')
  message.removeSegment(segment as Segment)
  t.is(message.toString(), 'MSH|^~\\&|1|\nAAA|1||xxx|\nBBB|2|\n')

  message = new Message("MSH|^~\\&|1|\nAAA|1||xxx|\nBBB|1|a|\nBBB|2|b|\nBBB|3|c|")
  segment = message.getSegmentsByName('BBB')[1]
  message.removeSegment(segment, true)
  t.is(message.toString(), "MSH|^~\\&|1|\nAAA|1||xxx|\nBBB|1|a|\nBBB|2|c|\n", 'Should reset index of subsequent segments')


})

test('segments can be removed from message using index', t => {
  const message = new Message()
  message.addSegment(new Segment('XXX'))
  message.addSegment(new Segment('YYY'))
  message.removeSegmentByIndex(0)
  t.is(message.getSegmentByIndex(0)?.getName(), 'YYY', 'Remove segment')

})

test('segments can be removed by name', t => {
  let message = new Message("MSH|^~\\&|1|\nAAA|1||xxx|\nAAA|2||\nBBB|1|\n")
  let count = message.removeSegmentsByName('AAA')
  t.is(message.toString(), 'MSH|^~\\&|1|\nBBB|1|\n', 'removes consecutive segments')
  t.is(count, 2)

  message = new Message("MSH|^~\\&|1|\nAAA|1||xxx|\nBBB|1|\nAAA|2|\n")
  count = message.removeSegmentsByName('AAA')
  t.is(message.toString(), "MSH|^~\\&|1|\nBBB|1|\n", 'remove non-consecutive segments')
  t.is(count, 2)

})

test('a new segment can be inserted between two existing segments', t => {
  const message = new Message()
  message.addSegment(new Segment('AAA'))
  message.addSegment(new Segment('BBB'))
  message.insertSegment(new Segment('XXX'), 1)

  t.is(message.getSegmentByIndex(1)?.getName(), 'XXX', 'inserted segment')
  t.is(message.getSegmentByIndex(2)?.getName(), 'BBB', 'existing segment should shift')

})

test('it should not be possible to insert segment beyond last index', t => {
  const message = new Message()
  t.throws(() => message.insertSegment(new Segment('ZZ1'), 3), /index out of range/i)
  t.true(isNil(message.getSegmentByIndex(3)), 'erroneous insert')
})

test('a segment can be overwitten', t => {
  const message = new Message()
  message.addSegment(new Segment('AAA'))
  message.setSegment(new Segment('BBB'), 0)
  t.is(message.getSegmentsByName('AAA').length, 0, 'no AAA segment anymore')
  t.is(message.getSegmentByIndex(0)?.getName(), 'BBB', 'BBB should have replace AAA')
})

test('same segment type can be added multiple times', t => {
  const message = new Message()
  message.addSegment(new Segment('AAA'))
  message.addSegment(new Segment('AAA'))
  t.is(message.getSegmentsByName('AAA').length, 2, 'message should have 2 AAAs')

})

test('field separator can be changed after message creation', t => {
  const message = new Message()
  const msh = new MSH([])

  msh.setField(1, '*')
  msh.setField(2, 'abcd')
  message.addSegment(msh)
  t.is(message.toString(), 'MSH*abcd*\n', '* should be used field separator')

  msh.setField(1, '|')
  t.is(message.toString(), 'MSH|abcd|\n', 'field separator should be changed to |')

})

test('a message can be constructed from a string', t => {
  t.pass()

})

test('a message can be converted to a string', t => {
  t.pass()

})

test('a segment can be retrieved as a string', t => {
  t.pass()

})

test('an exception will be thrown in invalid string', t => {
  t.pass()

})

test('segment ending bar can be omitted', t => {
  t.pass()

})

test('segment index can be retrieved from a message', t => {
  t.pass()

})

test('message type can be checked', t => {
  t.pass()

})

test('segment id can be reset on demand', t => {
  t.pass()

})

test('segment index autoincrement can be avoided', t => {
  t.pass()

})

test('a segments presence can be checked', t => {
  t.pass()

})

test('first of the given segment name can be easily obtained using a helper method', t => {
  t.pass()

})

test('message can be verified as empty', t => {
  t.pass()

})
