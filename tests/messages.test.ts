import test from 'tape'
import Message from '../lib/messages'
import { Segment, MSH } from '../lib/segments'
import { Field } from '../lib/types'

test('subfields can be retained when required', t => {
  const message = new Message("MSH|^~\\&|1|\rPV1|1|O|^AAAA1^^^BB|", null, true)
  const pv = (message.getSegmentByIndex(1) as Segment)
  const fields = pv.getField(3)
  t.deepEquals(fields, ['', 'AAAA1', '', '', 'BB'])
  t.end()
})

test('segments can be added to existing message', t => {
  const message = new Message()
  message.addSegment(new MSH())
  message.addSegment(new Segment('PID'))

  const s0 = message.getSegmentByIndex(0)
  const s1 = message.getSegmentByIndex(1)
  t.equals(s0?.getName(), 'MSH', 'Segment 0 name MSH')
  t.equals(s1?.getName(), 'PID', 'Segment 1 name PID')
  t.end()
})

test('fields can be added to existing segments', t => {
  const message = new Message()
  message.addSegment(new MSH())
  message.addSegment(new Segment('ABC'))

  const s0 = message.getSegmentByIndex(0)
  const s1 = message.getSegmentByIndex(1)

  s0?.setField(3, 'XXX')
  s1?.setField(2, 'Foo')

  t.equals(s0?.getField(3), 'XXX', '3rd field of MSH')
  t.equals(s1?.getField(2), 'Foo', '2nd field of ABC')
  t.equals(message.getSegmentByIndex(0)?.getField(3), 'XXX', '3rd field of MSH')
  t.end()
})

test('control characters are properly set from MSH segment', t => {
  const message = new Message('MSH|^~\\&|1|\rABC|||xxx|\r')
  t.equals(message.getSegmentByIndex(0)?.getField(2), '^~\\&')
  t.end()
})

test('control characters can be customized using second argument', t => {
  const msg = new Message('MSH|^~\\&|1|\nABC|||xxx|\n', { SEGMENT_SEPARATOR: '\r\n' })
  t.equals(msg.toString(), 'MSH|^~\\&|1|\r\nABC|||xxx|\r\n', 'custom line endings')
  t.end()
})

test('message can be converted to string', t => {
  const msg = new Message('MSH|^~\\&|1|\rABC|||xxx|\r')
  t.equals(msg.toString(), 'MSH|^~\\&|1|\nABC|||xxx|\n')
  t.end()
})

test('toString method throws exception when message empty', t => {
  const msg = new Message()
  t.throws(() => {
    msg.toString()
  })
  t.end()
})

test('components and subcomponents can be extracted from a field', t => {
  const msg = new Message()
  const field = 'xx^x&y&z^yy^zz'
  const result = msg.extractComponentsFromFields(field, false)
  t.deepEquals(result, ['xx', ['x', 'y', 'z'], 'yy', 'zz'])
  t.end()
})

test('fields and subfields can be set properly', t => {
  const message = new Message('MSH|^~\\&|1|\rABC|||xx^x&y&z^yy^zz|\r')
  const segment = message.getSegmentByIndex(1)
  const field = (segment?.getField(3) as any)
  t.equals('xx', field[0], 'Composed field')
  t.equals('y', field[1][1], 'subcomposed field')
  t.end()
})

test('fields can be separated by custom character', t => {
  const message = new Message('MSH*^~\\&*1\rABC***xxx\r')
  t.equals(message.toString(), 'MSH*^~\\&*1\nABC***xxx\n', 'string representation of message with * as field separator')
  t.end()
})

test('components of a field can be separated by custom character', t => {
  const message = new Message('MSH|*~\\&|1\rABC|||x*y*z\r')
  const field = message.getSegmentByIndex(1)?.getField(3) as any
  t.equals(field[0], 'x', 'composed field with * as separator between subfields')
  t.end()
})

test('subcomponents can be separated by a custom character', t => {
  const message = new Message("MSH|^~\\@|1\rABC|||a^x@y@z^b\r")
  const field = message.getSegmentByIndex(1)?.getField(3) as any
  t.equals(field[1][1], 'y', 'subcomposed field with @ as separator')
  t.end()
})

test('segments can be added from message', t => {
  const message = new Message()
  message.addSegment(new Segment('XXX'))
  const name = message.getSegmentByIndex(0)?.getName() as any
  t.equals(name, 'XXX', 'add segment')
  t.end()
})

test('segment can be removed from message', t => {
  let message = new Message("MSH|^~\\&|1|\nAAA|1||xxx|\nBBB|1|\nBBB|2|")
  let segment = message.getFirstSegmentInstance('BBB')
  message.removeSegment(segment as Segment)
  t.equals(message.toString(), 'MSH|^~\\&|1|\nAAA|1||xxx|\nBBB|2|\n')

  message = new Message("MSH|^~\\&|1|\nAAA|1||xxx|\nBBB|1|a|\nBBB|2|b|\nBBB|3|c|")
  segment = message.getSegmentsByName('BBB')[1] 
  message.removeSegment(segment, true)
  t.equals(message.toString(), "MSH|^~\\&|1|\nAAA|1||xxx|\nBBB|1|a|\nBBB|2|c|\n", 'Should reset index of subsequent segments')

  t.end()
})

test('segments can be removed from message using index', t => {
  t.pass()
  t.end()
})

test('segments can be removed by name', t => {
  t.pass()
  t.end()
})

test('a new segment can be inserted between two existing segments', t => {
  t.pass()
  t.end()
})

test('it should not be possible to insert segment beyond last index', t => {
  t.pass()
  t.end()
})

test('a segment can be overwitten', t => {
  t.pass()
  t.end()
})

test('same segment type can be added multiple times', t => {
  t.pass()
  t.end()
})

test('field separator can be changed after message creation', t => {
  t.pass()
  t.end()
})

test('a message can be constructed from a string', t => {
  t.pass()
  t.end()
})

test('a message can be converted to a string', t => {
  t.pass()
  t.end()
})

test('a segment can be retrieved as a string', t => {
  t.pass()
  t.end()
})

test('an exception will be thrown in invalid string', t => {
  t.pass()
  t.end()
})

test('segment ending bar can be omitted', t => {
  t.pass()
  t.end()
})

test('segment index can be retrieved from a message', t => {
  t.pass()
  t.end()
})

test('message type can be checked', t => {
  t.pass()
  t.end()
})

test('segment id can be reset on demand', t => {
  t.pass()
  t.end()
})

test('segment index autoincrement can be avoided', t => {
  t.pass()
  t.end()
})

test('a segments presence can be checked', t => {
  t.pass()
  t.end()
})

test('first of the given segment name can be easily obtained using a helper method', t => {
  t.pass()
  t.end()
})

test('message can be verified as empty', t => {
  t.pass()
  t.end()
})
