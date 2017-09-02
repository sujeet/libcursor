import {ContentEditableCursor} from '../src/libcursor';
import {Cursor} from '../src/libcursor';
import {TextAreaCursor} from '../src/libcursor';

const TEXT = '0123456789';
const HTML = `
<textarea id='textarea'>${TEXT}</textarea>
<p id='para' contenteditable>${TEXT}</p>
`;

var textarea = () => document.getElementById('textarea');
var para = () => document.getElementById('para');
var immutable = () => document.getElementById('immutable');

function unfocus() {
  document.activeElement.blur();
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
      expect(cursor.getTextBefore(len)).toBe(elem.textContent.substr(-len));
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
        .toBe(elem.textContent.substr(offset, len));
    }

    test(textarea());
    test(para());
  });
});
