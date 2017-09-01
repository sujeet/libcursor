// Utility function to get length of unicode strings takeing care of
// surrogate pairs.
// "𝟘𝟙𝟚𝟛𝟜𝟝𝟞𝟟𝟠𝟡".length is 20 we want it to be 10
// unicodeLength ("𝟘𝟙𝟚𝟛𝟜𝟝𝟞𝟟𝟠𝟡") returns 10
function unicodeLength (str) {
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

// Shim for Firefox and friends.
if (!HTMLTextAreaElement.prototype.setRangeText) {
    HTMLTextAreaElement.prototype.setRangeText = function (text) {
        var old_start = this.selectionStart;
        this.value = (
            this.value.substring (0, this.selectionStart) 
                + text
                + this.value.substring (this.selectionEnd,
                                        this.value.length)
        );
        this.setSelectionRange (old_start,
                                old_start + text.length);
    };
}


/**
 * @see Cursor.new
 */
class Cursor {
  /**
   * <i> Don't use this constructor. </i> Use Cursor.new instead.
   */
  constructor() {}
  /**
   * Static method to initialize and return an appropriate kind of cursor.
   *
   * @param [DomElement]
   * This must be either an element with contenteditable set to true,
   * or a textarea.
   *
   * @param [position {integer}]
   * This specifies the position of the cursor in the DomElement.
   * 
   * @return An appropriately initialized Cursor object.
   *
   * @example
   * Cursor.new()  // Returns current cursor under currently focused element.
   *
   * // Only DomElement specified: returns cursor at the end of the text.
   * Cursor.new(document.getElementById('mydiv'))
   * // #mydiv
   * // +-----------------+
   * // |           +     |
   * // |123456789..|     |
   * // |           +     |
   * // +-----------------+
   *
   * // With position specified:
   * Cursor.new(document.getElementById('mydiv'), 5)
   * // #mydiv
   * // +-----------------+
   * // |     +           |
   * // |12345|6789..     |
   * // |     +           |
   * // +-----------------+
   */
  static new(DomElement, position) {
    // The case when nothing is specified, just get the current position
    // where cursor is in the document.
    if (arguments.length == 0) {
      // As of now, let us just handle text area.
      if ((document.activeElement.nodeName == "TEXTAREA") ||
          ((document.activeElement.nodeName == "INPUT") && 
           (document.activeElement.getAttribute ("type") == "text"))) {
        return new TextAreaCursor ();
      }
      else if (document.activeElement.isContentEditable) {
        return new ContentEditableCursor ();
      }
      else {
        // TODO: Raise an error.
      }
    }
    
    else if (arguments.length == 1) {
      if ((DomElement.nodeName == "TEXTAREA") ||
          ((DomElement.nodeName == "INPUT") && 
           (DomElement.getAttribute ("type") == "text"))) {
        return new TextAreaCursor (DomElement);
      }
      else if (DomElement.isContentEditable) {
        return new ContentEditableCursor (DomElement);
      }
      else {
        // TODO: Raise an error.
      }
    }
    
    else if (arguments.length == 2) {
      if ((DomElement.nodeName == "TEXTAREA") ||
          ((DomElement.nodeName == "INPUT") && 
           (DomElement.getAttribute ("type") == "text"))) {
        return new TextAreaCursor (DomElement, position);
      }
      else if (document.activeElement.isContentEditable) {
        return new ContentEditableCursor (DomElement, position);
      }
      else {
        // TODO: Raise an error.
      }
    }
    
    return null;
    // TODO: Raise an error.
  }

  /**
   * Same as insertBefore
   * @see Cursor#insertBefore
   */
  insert(text) {
    return this.insertBefore (text);
  }

  /**
   * Inserts text at the position of the cursor, moves the cursor at the
   * end of the inserted text.
   *
   * @param {string} text The text to be inserted.
   *
   * @example
   * 
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
   * cursor.insertBefore('is')
   * //        +
   * // this is| good
   * //        +
   */
  insertBefore(text) {}

  /**
   * Inserts text at the position of the cursor, keeps the cursor at the
   * start of the inserted text. 
   *
   * @method
   * 
   * @param {string} text The text to be inserted.
   *
   * @example
   * 
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
   * cursor.insertAfter('is')
   * //      +  
   * // this |is good
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
    if (offset > 0) return this.moveForward (offset);
    else return this.moveBackward (-offset);
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
    if (amount > 0) return this.deleteForward (amount);
    else return this.deleteBackward (-amount);
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
   * //         +                                      +
   * // this is |awesome -> deleteBackward (3) -> this |awesome
   * //         +                                      +
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
   * 
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
   * cursor.getText(5) === "s is "
   */
  getTextBefore(len) {
    var bigstr = this.getText (-len, 0);
    var smallstr = this.getText (0, 0);
    return bigstr.substring (0, bigstr.length - smallstr.length);
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
   * cursor.getTextBefore(3) === "awe"
   * 
   * //         +---+
   * // this is |awe|some
   * //         +---+
   * cursor.getText(4) === "some"
   */
  getTextAfter(len) {
    var bigstr = this.getText (0, len);
    var smallstr = this.getText (0, 0);
    return bigstr.substring (smallstr.length, bigstr.length);
  }
}

function countTextNodes (elem) {
    var count = 0;
    for (var i = 0; i < elem.childNodes.length; i++) {
        if (elem.childNodes[i].nodeType == Node.TEXT_NODE) count++;
    }
    return count;
}

class TextAreaCursor extends Cursor {
  constructor(Textarea, position) {
    super();
    if (arguments.length == 0) {
      this.textarea = document.activeElement;
    }
    else if (arguments.length == 1) {
      this.textarea = Textarea;
      this.textarea.setSelectionRange (this.textarea.value.length,
                                       this.textarea.value.length);
    }
    else if (arguments.length == 2) {
      this.textarea = Textarea;
      this.textarea.setSelectionRange (position,
                                       position);
    }
  }

  insertBefore(text) {
    this.textarea.setRangeText (text);
    this.textarea.setSelectionRange (
      this.textarea.selectionStart + text.length,
      this.textarea.selectionStart + text.length
    );
    return this;
  }

  insertAfter(text) {
    this.textarea.setRangeText (text);
    this.textarea.setSelectionRange (this.textarea.selectionStart,
                                     this.textarea.selectionStart);
    return this;
  }

  moveForward(offset) {
    this.textarea.setSelectionRange (this.textarea.selectionEnd + offset,
                                     this.textarea.selectionEnd + offset);
    return this;
  }

  moveBackward(offset) {
    this.textarea.setSelectionRange (this.textarea.selectionStart - offset,
                                     this.textarea.selectionStart - offset);
    return this;
  }

  deleteForward(amount) {
    this.textarea.setSelectionRange (this.textarea.selectionEnd,
                                     this.textarea.selectionEnd + amount);
    this.textarea.setRangeText ("");
    return this;
  }

  deleteBackward(amount) {
    this.textarea.setSelectionRange (this.textarea.selectionStart - amount,
                                     this.textarea.selectionStart);
    this.textarea.setRangeText ("");
    return this;
  }

  getText(start, end) {
    var new_start = this.textarea.selectionStart + start;
    var new_end = this.textarea.selectionEnd + end;
    return this.textarea.value.substring (new_start, new_end);
  }
}

class ContentEditableCursor extends Cursor {
  constructor(DomElement, position) {
    super();
    if (arguments.length == 0) {
      this.selection = document.getSelection ();
    }
    else if (arguments.length == 1) {
      DomElement.focus();
      this.selection = document.getSelection ();
      this.selection.extend (
        DomElement,
        DomElement.children.length + countTextNodes (DomElement)
      );
      this.selection.collapseToEnd ();
    }
    else if (arguments.length == 2) {
      DomElement.focus();
      this.selection = document.getSelection ();
      this.selection.extend (DomElement, 0);
      this.selection.collapseToStart ();
      for (var i = 0; i < position; i++) {
        this.selection.modify ('move',
                               'forward',
                               'character');
      }
    }
  }

  insertBefore(text) {
    this.insertAfter (text);
    this.move (unicodeLength (text));
    return this;
  }

  insertAfter(text) {
    var range = this.selection.getRangeAt (0);
    range.deleteContents ();
    range.insertNode (document.createTextNode (text));
    this.selection.collapseToStart ();
    return this;
  }

  moveForward(offset) {
    this.selection.collapseToEnd ();
    while (offset--) {
      this.selection.modify ('move', 'forward', 'character');
    }
    return this;
  }

  moveBackward(offset) {
    this.selection.collapseToStart ();
    while (offset--) {
      this.selection.modify ('move', 'backward', 'character');
    }
    return this;
  }

  deleteForward(amount) {
    this.selection.collapseToEnd ();
    while (amount--) {
      this.selection.modify ('extend', 'forward', 'character');
    }
    this.selection.getRangeAt (0).deleteContents ();
    return this;
  }

  deleteBackward(amount) {
    this.selection.collapseToStart ();
    while (amount--) {
      this.selection.modify ('extend', 'backward', 'character');
    }
    this.selection.getRangeAt (0).deleteContents ();
    return this;
  }

  getText(start, end) {
    var range = this.selection.getRangeAt (0);
    return this.selection.anchorNode.textContent.substring (
      range.startOffset + start,
      range.endOffset + end
    );
  }
}
