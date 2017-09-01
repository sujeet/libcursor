// Utility function to get length of unicode strings takeing care of
// surrogate pairs.
// "𝟘𝟙𝟚𝟛𝟜𝟝𝟞𝟟𝟠𝟡".length is 20 we want it to be 10
// unicodeLength ("𝟘𝟙𝟚𝟛𝟜𝟝𝟞𝟟𝟠𝟡") returns 10
function unicodeLength(str) {
  var count = 0;
  for (var i=0; i < str.length; i++) {
    if ((str.charCodeAt(i) & 0xF800) == 0xD800)
      // Increase the count here because this is the start of of a
      // surrogate pair.
      i++;
    count++;
  }
  return count;
}

function setRangeText(elem, text) {
  var old_start = elem.selectionStart;
  var old_str = elem.value;
  elem.value =
    old_str.substring(0, elem.selectionStart)
    + text
    + old_str.substring(elem.selectionEnd, old_str.length);
  elem.setSelectionRange(old_start, old_start + text.length);
}

// Shim for Firefox and friends.
if (!HTMLTextAreaElement.prototype.setRangeText) {
  HTMLTextAreaElement.prototype.setRangeText = function(text) {
    setRangeText(this, text);
  };
}

if (!HTMLInputElement.prototype.setRangeText) {
  HTMLInputElement.prototype.setRangeText = function(text) {
    setRangeText(this, text);
  };
}

class Cursor {
  /**
   * <i>Don't use this constructor.</i>
   * Use one of {@link Cursor.current}, {@link Cursor.atTheEndOf},
   * {@link Cursor.inside} instead.
   */
  constructor() {}

  /**
   * @param domElement {HTMLElement}
   * This must be either an element with contenteditable set to true,
   * or a textarea.
   *
   * @return {Cursor} A cursor at the end of domElement.
   *
   * @example
   * Cursor.atTheEndOf(document.getElementById('mydiv'))
   * // #mydiv
   * // +-----------------+
   * // |           +     |
   * // |123456789..|     |
   * // |           +     |
   * // +-----------------+
   */
  static atTheEndOf(domElement) {
    return Cursor
      .getConcreteSubclassFor(domElement)
      .atTheEndOf(domElement);
  }

  /**
   * @param domElement {HTMLElement}
   * This must be either an element with contenteditable set to true,
   * or a textarea.
   *
   * @param position {integer}
   * This specifies the position of the cursor in the domElement.
   *
   * @return {Cursor} A cursor inside the domElement at the specified offset.
   *
   * @example
   * Cursor.new(document.getElementById('mydiv'), 5)
   * // #mydiv
   * // +-----------------+
   * // |     +           |
   * // |12345|6789..     |
   * // |     +           |
   * // +-----------------+
   */
  static inside(domElement, offset) {
    return Cursor
      .getConcreteSubclassFor(domElement)
      .inside(domElement, offset);
  }

  /**
   * @return {Cursor} Current cursor under currently focused element.
   */
  static current() {
    var domElement = document.activeElement;
    return Cursor
      .getConcreteSubclassFor(domElement)
      .current();
  }

  static getConcreteSubclassFor(domElement) {
    if ((domElement.nodeName == "TEXTAREA") ||
        ((domElement.nodeName == "INPUT") &&
         (domElement.getAttribute("type") == "text"))) {
      return TextAreaCursor;
    }
    else if (domElement.isContentEditable) {
      return ContentEditableCursor;
    }
    else {
      throw new Error(`Can't create cursor for ${domElement}`);
    }
  }

  /**
   * Same as insertBefore
   * @see Cursor#insertBefore
   */
  insert(text) {
    return this.insertBefore(text);
  }

  /**
   * Inserts text at the position of the cursor, moves the cursor at the
   * end of the inserted text. Any selection is deleted.
   *
   * @param {string} text The text to be inserted.
   *
   * @example
   * //     +
   * // big | apple
   * //     +
   * cursor.insertBefore('rotten')
   * //           +
   * // big rotten| apple
   * //           +
   *
   * //      +-----+
   * // this |isn't| good
   * //      +-----+
   * cursor.insertBefore('was')
   * //         +
   * // this was| good
   * //         +
   */
  insertBefore(text) {}

  /**
   * Inserts text at the position of the cursor, keeps the cursor at the
   * start of the inserted text. Any selection is deleted.
   *
   * @param {string} text The text to be inserted.
   *
   * @example
   * //     +
   * // big | apple
   * //     +
   * cursor.insertAfter('rotten')
   * //     +
   * // big |rotten apple
   * //     +
   *
   * //      +-----+
   * // this |isn't| good
   * //      +-----+
   * cursor.insertAfter('was')
   * //      +
   * // this |was good
   * //      +
   */
  insertAfter(text) {}

  /**
   * Same as moveForward or moveBackward depending on the sign of offset.
   *
   * @param {integer} offset The amount by which cursor should be moved.
   *
   * @example
   * // These two are same:
   * cursor.move(9)
   * cursor.moveForward(9)
   *
   * // These two are same:
   * cursor.move(-9)
   * cursor.moveBackward(9)
   *
   * @see Cursor#moveForward
   * @see Cursor#moveBackward
   */
  move(offset) {
    if (offset > 0) return this.moveForward(offset);
    else return this.moveBackward(-offset);
  }

  /**
   * Moves the cursor forward by the amount specified.
   *
   * @param {integer} offset The amount by which the cursor should
   * move forward.
   *
   * @example
   * //         +
   * // this is |awesome
   * //         +
   * cursor.moveForward(3)
   * //            +
   * // this is awe|some
   * //            +
   *
   * //         +---+
   * // this is |awe|some
   * //         +---+
   * cursor.moveForward(3)
   * //               +
   * // this is awesom|e
   * //               +
   */
  moveForward(offset) {}

  /**
   * Moves the cursor backward by the amount specified.
   *
   * @param {integer} offset The amount by which the cursor should
   * move backward.
   *
   * @example
   * //         +
   * // this is |awesome
   * //         +
   * cursor.moveBackward(3)
   * //      +
   * // this |is awesome
   * //      +
   *
   * //         +---+
   * // this is |awe|some
   * //         +---+
   * cursor.moveBackward(3)
   * //      +
   * // this |is awesome
   * //      +
   */
  moveBackward(offset) {}

  /**
   * Same as deleteForward or deleteBackward depending on the sign of amount.
   *
   * @param {integer} amount The number of characters to be deleted.
   *
   * @example
   * // These two are same:
   * cursor.delete(9)
   * cursor.deleteForward(9)
   *
   * // These two are same:
   * cursor.delete(-9)
   * cursor.deleteBackward(9)
   *
   * @see Cursor#deleteForward
   * @see Cursor#deleteBackward
   */
  delete(amount) {
    if (amount > 0) return this.deleteForward(amount);
    else return this.deleteBackward(-amount);
  }

  /**
   * Deletes the specified number of characters ahead of the cursor.
   *
   * @param {integer} amount The number of characters to be deleted.
   *
   * @example
   * //         +
   * // this is |awesome
   * //         +
   * cursor.deleteForward(3)
   * //         +
   * // this is |some
   * //         +
   *
   * //         +---+
   * // this is |awe|some
   * //         +---+
   * cursor.deleteForward(4)
   * //            +
   * // this is awe|
   * //            +
   */
  deleteForward(amount) {}

  /**
   * Deletes the specified number of characters before the cursor.
   *
   * @param {integer} amount The number of characters to be deleted.
   *
   * @example
   * //         +
   * // this is |awesome
   * //         +
   * cursor.deleteBackward(3)
   * //      +
   * // this |awesome
   * //      +
   *
   * //         +---+
   * // this is |awe|some
   * //         +---+
   * cursor.deleteBackward(4)
   * //     +
   * // this|awesome
   * //     +
   */
  deleteBackward(amount) {}

  /**
   * Get the text surrounding the cursor.
   * <b>Note:</b> The cursor itself does not move.
   *
   * @param {integer} start Start of the cursor moves this much forward.
   * @param {integer} end End of the cursor moves this much forward.
   * @return {string} The text enclosed between the start and end of
   *                  the cursor after the (imaginary) moving is done.
   *
   * @example
   * //         +
   * // this is |awesome
   * //         +
   * cursor.getText(-3, 3) === "is awe"
   * cursor.getText(-4, 0) === " is "
   * cursor.getText(2, 4) === "es"
   *
   * //         +---+
   * // this is |awe|some
   * //         +---+
   * cursor.getText(-3, 3) === "is awesom"
   * cursor.getText(-4, 0) === " is awe"
   * cursor.getText(2, 4) === "esome"
   */
  getText(start, end) {}

  /**
   * Get the text just before the cursor.
   * <b>Note:</b> The cursor itself does not move.
   *
   * @param {integer} len Length of the string wanted.
   * @return {string} The string just before the cursor,
   *                  AT MAXIMUM of length len.
   *
   * @example
   * //         +
   * // this is |awesome
   * //         +
   * cursor.getTextBefore(4) === " is "
   *
   * //         +---+
   * // this is |awe|some
   * //         +---+
   * cursor.getTextBefore(5) === "s is "
   */
  getTextBefore(len) {
    var bigstr = this.getText(-len, 0);
    var smallstr = this.getText(0, 0);
    return bigstr.substring(0, bigstr.length - smallstr.length);
  }

  /**
   * Get the text just after the cursor.
   * <b>Note:</b> The cursor itself does not move.
   *
   * @param {integer} len Length of the string wanted.
   * @return {string} The string just after the cursor,
   *                  AT MAXIMUM of length len.
   *
   * @example
   * //         +
   * // this is |awesome
   * //         +
   * cursor.getTextAfter(3) === "awe"
   *
   * //         +---+
   * // this is |awe|some
   * //         +---+
   * cursor.getTextAfter(4) === "some"
   */
  getTextAfter(len) {
    var bigstr = this.getText(0, len);
    var smallstr = this.getText(0, 0);
    return bigstr.substring(smallstr.length, bigstr.length);
  }
}

class TextAreaCursor extends Cursor {
  constructor(textArea, position) {
    super();
    this.textarea = textArea;
    if (arguments.length > 1) {
      this.textarea.setSelectionRange(position, position);
    }
  }

  static atTheEndOf(textArea) {
    return new TextAreaCursor(textArea, textArea.value.length);
  }

  static inside(textArea, offset) {
    return new TextAreaCursor(textArea, offset);
  }

  static current() {
    return new TextAreaCursor(document.activeElement);
  }

  insertBefore(text) {
    this.textarea.setRangeText(text);
    this.textarea.setSelectionRange(
      this.textarea.selectionStart + text.length,
      this.textarea.selectionStart + text.length
    );
    return this;
  }

  insertAfter(text) {
    this.textarea.setRangeText(text);
    this.textarea.setSelectionRange(this.textarea.selectionStart,
                                    this.textarea.selectionStart);
    return this;
  }

  moveForward(offset) {
    this.textarea.setSelectionRange(this.textarea.selectionEnd + offset,
                                    this.textarea.selectionEnd + offset);
    return this;
  }

  moveBackward(offset) {
    this.textarea.setSelectionRange(this.textarea.selectionStart - offset,
                                    this.textarea.selectionStart - offset);
    return this;
  }

  deleteForward(amount) {
    this.textarea.setSelectionRange(this.textarea.selectionEnd,
                                    this.textarea.selectionEnd + amount);
    this.textarea.setRangeText("");
    return this;
  }

  deleteBackward(amount) {
    this.textarea.setSelectionRange(this.textarea.selectionStart - amount,
                                    this.textarea.selectionStart);
    this.textarea.setRangeText("");
    return this;
  }

  getText(start, end) {
    var new_start = this.textarea.selectionStart + start;
    var new_end = this.textarea.selectionEnd + end;
    return this.textarea.value.substring(new_start, new_end);
  }
}

class ContentEditableCursor extends Cursor {
  constructor(selection) {
    super();
    this.selection = selection;
  }

  static atTheEndOf(domElement) {
    domElement.focus();
    var selection = document.getSelection();
    selection.extend(
      domElement,
      domElement.children.length + countTextNodes(domElement)
    );
    selection.collapseToEnd();
    return new ContentEditableCursor(selection);
  }

  static inside(domElement, offset) {
    domElement.focus();
    var selection = document.getSelection();
    selection.extend(domElement, 0);
    selection.collapseToStart();
    for (var i = 0; i < offset; i++) {
      this.selection.modify('move', 'forward', 'character');
    }
    return new ContentEditableCursor(selection);
  }

  static current() {
    var selection = document.getSelection();
    return new ContentEditableCursor(selection);
  }

  insertBefore(text) {
    this.insertAfter(text);
    this.move(unicodeLength(text));
    return this;
  }

  insertAfter(text) {
    var range = this.selection.getRangeAt(0);
    range.deleteContents();
    range.insertNode(document.createTextNode(text));
    this.selection.collapseToStart();
    return this;
  }

  moveForward(offset) {
    this.selection.collapseToEnd();
    while (offset--) {
      this.selection.modify('move', 'forward', 'character');
    }
    return this;
  }

  moveBackward(offset) {
    this.selection.collapseToStart();
    while (offset--) {
      this.selection.modify('move', 'backward', 'character');
    }
    return this;
  }

  deleteForward(amount) {
    this.selection.collapseToEnd();
    while (amount--) {
      this.selection.modify('extend', 'forward', 'character');
    }
    this.selection.getRangeAt(0).deleteContents();
    return this;
  }

  deleteBackward(amount) {
    this.selection.collapseToStart();
    while (amount--) {
      this.selection.modify('extend', 'backward', 'character');
    }
    this.selection.getRangeAt(0).deleteContents();
    return this;
  }

  getText(start, end) {
    var range = this.selection.getRangeAt(0);
    return this.selection.anchorNode.textContent.substring(
      range.startOffset + start,
      range.endOffset + end
    );
  }
}

function countTextNodes(elem) {
  var count = 0;
  for (var i = 0; i < elem.childNodes.length; i++) {
    if (elem.childNodes[i].nodeType == Node.TEXT_NODE) count++;
  }
  return count;
}
