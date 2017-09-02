import {ContentEditableCursor} from '../src/libcursor';
import {Cursor} from '../src/libcursor';
import {TextAreaCursor} from '../src/libcursor';

const TEXT = '0123456789';

function makeHtml(text) {
  return `
    <textarea id='textarea'>${text}</textarea>
    <p id='para' contenteditable>${text}</p>`;
}

const HTML = makeHtml(TEXT);

var textarea = () => document.getElementById('textarea');
var para = () => document.getElementById('para');
var immutable = () => document.getElementById('immutable');

function unfocus() {
  document.activeElement.blur();
}

function getText(elem) {
  if (elem.value === undefined) return elem.textContent;
  else return elem.value;
}

describe('Cursor.current', () => {
  document.body.innerHTML = HTML;

  it('should get cursor from editable focused element', () => {
    textarea().focus();
    expect(Cursor.current() instanceof TextAreaCursor).toBe(true);

    para().focus();
    expect(Cursor.current() instanceof ContentEditableCursor).toBe(true);
  });

  it('should throw error if focused element is not editable', () => {
    unfocus();
    expect(Cursor.current).toThrow();
  });
});

describe('Cursor.inside and Cursor.atTheEndOf', () => {
  document.body.innerHTML = HTML;

  it('should disregard focused element', () => {
    function test(elem, cls) {
      expect(Cursor.inside(elem, 0) instanceof cls).toBe(true);
      expect(Cursor.atTheEndOf(elem) instanceof cls).toBe(true);
    }

    unfocus();
    test(textarea(), TextAreaCursor);

    para().focus();
    test(textarea(), TextAreaCursor);

    unfocus();
    test(para(), ContentEditableCursor);

    textarea().focus();
    test(para(), ContentEditableCursor);
  });
});

describe('Cursor.atTheEndOf', () => {
  document.body.innerHTML = HTML;

  it('should put the cursor at the end', () => {
    function test(elem) {
      var len = 5;
      expect(len).toBeLessThan(TEXT.length);

      var cursor = Cursor.atTheEndOf(elem);
      expect(cursor.getTextBefore(len)).toBe(getText(elem).substr(-len));
    }

    test(textarea());
    test(para());
  });
});

describe('Cursor.inside', () => {
  document.body.innerHTML = HTML;

  it('should put the cursor at the specified offset', () => {
    function test(elem) {
      var len = 2;
      var offset = 3;
      expect(offset + len).toBeLessThan(TEXT.length);

      var cursor = Cursor.inside(elem, offset);
      expect(cursor.getTextAfter(len))
        .toBe(getText(elem).substr(offset, len));
    }

    test(textarea());
    test(para());
  });
});

function testOperations(startText, startOffset, operations, endText) {
  function test(mkElem) {
    document.body.innerHTML = makeHtml(startText);
    var elem = mkElem();
    var cursor = Cursor.inside(elem, startOffset);
    expect(getText(elem)).toBe(startText);
    operations(cursor);
    expect(getText(elem)).toBe(endText);
  }
  test(para);
  test(textarea);
}

describe('Deletion methods', () => {
  it('should delete correctly', () => {
    testOperations(
      '1234567890',
      5,
      (cursor) => {
        cursor.delete(-3);        // 12|67890
        cursor.deleteForward(2);  // 12|890
        cursor.deleteBackward(1); // 1|890
      },
      '1890'
    );
  });
});

describe('Insertion methods', () => {
  it('should insert correctly', () => {
    testOperations(
      '1234',
      2,
      (cursor) => {
        cursor.insert('abc');      // 12abc|34
        expect(cursor.getTextBefore(1)).toBe('c');
        cursor.insertAfter('-');   // 12abc|-34
        expect(cursor.getTextBefore(1)).toBe('c');
        cursor.insertBefore('~*'); // 12abc~*|-34
        expect(cursor.getTextBefore(1)).toBe('*');
      },
      '12abc~*-34'
    );
  });
});

describe('Text retrieval methods', () => {
  it('should get text correctly', () => {
    testOperations(
      '1234',
      2,
      (cursor) => {
        // 12|34
        expect(cursor.getTextBefore(0)).toBe('');
        expect(cursor.getTextBefore(1)).toBe('2');
        expect(cursor.getTextBefore(2)).toBe('12');
        expect(cursor.getTextBefore(999)).toBe('12');

        expect(cursor.getTextAfter(0)).toBe('');
        expect(cursor.getTextAfter(1)).toBe('3');
        expect(cursor.getTextAfter(2)).toBe('34');
        expect(cursor.getTextAfter(999)).toBe('34');

        expect(cursor.getText(0, 0)).toBe('');

        expect(cursor.getText(-1, 0)).toBe('2');
        expect(cursor.getText(-2, 0)).toBe('12');
        expect(cursor.getText(-999, 0)).toBe('12');

        expect(cursor.getText(0, 1)).toBe('3');
        expect(cursor.getText(0, 2)).toBe('34');
        expect(cursor.getText(0, 999)).toBe('34');

        expect(cursor.getText(-1, 1)).toBe('23');
        expect(cursor.getText(-1, 2)).toBe('234');
        expect(cursor.getText(-1, 999)).toBe('234');

        expect(cursor.getText(-2, 1)).toBe('123');
        expect(cursor.getText(-2, 2)).toBe('1234');
        expect(cursor.getText(-2, 999)).toBe('1234');

        expect(cursor.getText(-999, 1)).toBe('123');
        expect(cursor.getText(-999, 2)).toBe('1234');
        expect(cursor.getText(-999, 999)).toBe('1234');
      },
      '1234'
    );
  });
});

describe('Movement methods', () => {
  it('should move cursor correctly', () => {
    testOperations(
      '1234',
      2,
      (cursor) => {
        function testMove(amount, charBefore, charAfter) {
          cursor.move(amount);
          expect(cursor.getTextBefore(1)).toBe(charBefore);
          expect(cursor.getTextAfter(1)).toBe(charAfter);
        }
        testMove(0, '2', '3');

        testMove(1, '3', '4');
        testMove(1, '4', '');
        testMove(1, '4', '');
        testMove(999, '4', '');

        testMove(-2, '2', '3');

        testMove(-1, '1', '2');
        testMove(-1, '', '1');
        testMove(-1, '', '1');
        testMove(-999, '', '1');
      },
      '1234'
    );
  });
});
