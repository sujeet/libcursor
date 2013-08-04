/**
 * Represents a Cursor.
 * @constructor
 * <b> Don't use this </b>
 * Use Cursor.new instead.
 * @see Cursor.new
 */
function Cursor () {}

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
 * Static method to initialize and return an appropriate kind of cursor.
 * <pre>
 * 1) No arguments : Current cursor under currently focused element will be returned.
 * 
 * 2) Only DomElement specified : Cursor at the end of the text will be returned.
 * +-----------------------+
 * |                +      |
 * | text content...|      |
 * |                +      |
 * +-----------------------+
 * 
 * 3) DomElement and position both specified:
 * Cursor.new (document.getElementById('mydiv'), 5) will return following:
 * #mydiv
 * +-----------------+
 * |     +           |
 * |12345|6789..     |
 * |     +           |
 * +-----------------+
 * </pre>
 * @function
 * 
 * @param [DomElement]
 * This must be either an element with contenteditable set to true,
 * or a textarea.
 *
 * @param [position]
 * This specifies the position of the cursor in the DomElement.
 * 
 * @return An appropriately initialized Cursor object.
 */
Cursor.new = function (DomElement, position) {
    // The case when nothing is specified, just get the current position
    // where cursor is in the document.
    if (arguments.length == 0) {
        // As of now, let us just handle text area.
        if (document.activeElement.nodeName == "TEXTAREA") {
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
        if (DomElement.nodeName == "TEXTAREA") {
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
        if (DomElement.nodeName == "TEXTAREA") {
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
};

function TextAreaCursor (Textarea, position) {
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

function countTextNodes (elem) {
    var count = 0;
    for (var i = 0; i < elem.childNodes.length; i++) {
        if (elem.childNodes[i].nodeType == Node.TEXT_NODE) count++;
    }
    return count;
}

function ContentEditableCursor (DomElement, position) {
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

/**
 * Same as insertBefore
 * @see Cursor#insertBefore
 * @method
 */
Cursor.prototype.insert = function (text) {
    return this.insertBefore (text);
};
TextAreaCursor.prototype.insert = Cursor.prototype.insert;
ContentEditableCursor.prototype.insert = Cursor.prototype.insert;

/**
 * Inserts text at the position of the cursor, moves the cursor at the
 * end of the inserted text.
 * <pre>
 * Examples:
 * 
 *     +                                               +
 * big | apple -> insertBefore ('rotten') -> big rotten| apple
 *     +                                               +
 * 
 *      +-----+                                       +
 * this |isn't| good -> insertBefore ('is') -> this is| good
 *      +-----+                                       +
 * </pre>
 * @method
 * 
 * @param {string} text The text to be inserted.
 */
Cursor.prototype.insertBefore = function (text) {
};

TextAreaCursor.prototype.insertBefore = function (text) {
    this.textarea.setRangeText (text);
    this.textarea.setSelectionRange (
        this.textarea.selectionStart + text.length,
        this.textarea.selectionStart + text.length
    );
    return this;
};

ContentEditableCursor.prototype.insertBefore = function (text) {
    this.insertAfter (text);
    this.move (unicodeLength (text));
    return this;
};

/**
 * Inserts text at the position of the cursor, keeps the cursor at the
 * start of the inserted text. 
 * <pre>
 * Examples:
 * 
 *     +                                        +
 * big | apple -> insertAfter ('rotten') -> big |rotten apple
 *     +                                        +
 * 
 *      +-----+                                    +
 * this |isn't| good -> insertAfter ('is') -> this |is good
 *      +-----+                                    +
 * </pre>
 * @method
 * 
 * @param {string} text The text to be inserted.
 */
Cursor.prototype.insertAfter = function (text) {
};

TextAreaCursor.prototype.insertAfter = function (text) {
    this.textarea.setRangeText (text);
    this.textarea.setSelectionRange (this.textarea.selectionStart,
                                     this.textarea.selectionStart);
    return this;
};

ContentEditableCursor.prototype.insertAfter = function (text) {
    var range = this.selection.getRangeAt (0);
    range.deleteContents ();
    range.insertNode (document.createTextNode (text));
    this.selection.collapseToStart ();
    return this;
};

/**
 * Same as moveForward or moveBackward depending on the sign of offset.
 * <pre>
 * move (9) is same as moveForward (9).
 * move (-9) is same as moveBackward (9).
 * </pre>
 * @see Cursor#moveForward
 * @see Cursor#moveBackward
 * @method
 * 
 * @param {integer} offset The amount by which cursor should be moved.
 */
Cursor.prototype.move = function (offset) {
    if (offset > 0) return this.moveForward (offset);
    else return this.moveBackward (-offset);
};
TextAreaCursor.prototype.move = Cursor.prototype.move;
ContentEditableCursor.prototype.move = Cursor.prototype.move;

/**
 * Moves the cursor forward by the amount specified.
 * <pre>
 * Examples:
 * 
 *         +                                         +
 * this is |awesome -> moveForward (3) -> this is awe|some
 *         +                                         +
 *
 *         +---+                                         +
 * this is |awe|some -> moveForward (3) -> this is awesom|e
 *         +---+                                         +
 * 
 * </pre>
 * @method
 * 
 * @param {positive integer} offset The amount by which the cursor should
 * move forward.
 */
Cursor.prototype.moveForward = function (offset) {};

TextAreaCursor.prototype.moveForward = function (offset) {
    this.textarea.setSelectionRange (this.textarea.selectionEnd + offset,
                                     this.textarea.selectionEnd + offset);
    return this;
};

ContentEditableCursor.prototype.moveForward = function (offset) {
    this.selection.collapseToEnd ();
    while (offset--) {
        this.selection.modify ('move', 'forward', 'character');
    }
    return this;
};

/**
 * Moves the cursor backward by the amount specified.
 * <pre>
 * Examples:
 * 
 *         +                                    +
 * this is |awesome -> moveBackward (3) -> this |is awesome
 *         +                                    +
 *
 *         +---+                                 +
 * this is |awe|some -> moveBackward (3) -> this |is awesome
 *         +---+                                 +
 * 
 * </pre>
 * @method
 * 
 * @param {positive integer} offset The amount by which the cursor should
 * move backward.
 */
Cursor.prototype.moveBackward = function (offset) {};

TextAreaCursor.prototype.moveBackward = function (offset) {
    this.textarea.setSelectionRange (this.textarea.selectionStart - offset,
                                     this.textarea.selectionStart - offset);
    return this;
};

ContentEditableCursor.prototype.moveBackward = function (offset) {
    this.selection.collapseToStart ();
    while (offset--) {
        this.selection.modify ('move', 'backward', 'character');
    }
    return this;
};

/**
 * Same as deleteForward or deleteBackward depending on the sign of amount.
 * <pre>
 * delete (9) is same as deleteForward (9).
 * delete (-9) is same as deleteBackward (9).
 * </pre>
 * @see Cursor#deleteForward
 * @see Cursor#deleteBackward
 * @method
 * 
 * @param {integer} amount The number of characters to be deleted.
 */
Cursor.prototype.delete = function (amount) {
    if (amount > 0) return this.deleteForward (amount);
    else return this.deleteBackward (-amount);
};

TextAreaCursor.prototype.delete = Cursor.prototype.delete;
ContentEditableCursor.prototype.delete = Cursor.prototype.delete;

/**
 * Deletes the specified number of characters ahead of the cursor.
 * <pre>
 * Examples:
 * 
 *         +                                        +
 * this is |awesome -> deleteForward (3) -> this is |some
 *         +                                        +
 *
 *         +---+                                        +
 * this is |awe|some -> deleteForward (4) -> this is awe|
 *         +---+                                        +
 * 
 * </pre>
 * @method
 * 
 * @param {positive integer} amount The number of characters to be deleted.
 */
Cursor.prototype.deleteForward = function (amount) {};

TextAreaCursor.prototype.deleteForward = function (amount) {
    this.textarea.setSelectionRange (this.textarea.selectionEnd,
                                     this.textarea.selectionEnd + amount);
    this.textarea.setRangeText ("");
    return this;
};

ContentEditableCursor.prototype.deleteForward = function (amount) {
    this.selection.collapseToEnd ();
    while (amount--) {
        this.selection.modify ('extend', 'forward', 'character');
    }
    this.selection.getRangeAt (0).deleteContents ();
    return this;
};

/**
 * Deletes the specified number of characters before the cursor.
 * <pre>
 * Examples:
 * 
 *         +                                      +
 * this is |awesome -> deleteBackward (3) -> this |awesome
 *         +                                      +
 *
 *         +---+                                  +
 * this is |awe|some -> deleteBackward (4) -> this|awesome
 *         +---+                                  +
 * 
 * </pre>
 * @method
 * 
 * @param {positive integer} amount The number of characters to be deleted.
 */
Cursor.prototype.deleteBackward = function (amount) {};

TextAreaCursor.prototype.deleteBackward = function (amount) {
    this.textarea.setSelectionRange (this.textarea.selectionStart - amount,
                                     this.textarea.selectionStart);
    this.textarea.setRangeText ("");
    return this;
};

ContentEditableCursor.prototype.deleteBackward = function (amount) {
    this.selection.collapseToStart ();
    while (amount--) {
        this.selection.modify ('extend', 'backward', 'character');
    }
    this.selection.getRangeAt (0).deleteContents ();
    return this;
};

/**
 * Get the text surrounding the cursor.
 * <pre>
 * Examples:
 * 
 *         +      
 * this is |awesome
 *         +     
 * -> getText (-3, 3) "is awe"
 * -> getText (-4, 0) " is "
 * -> getText (2, 4)  "es"
 * 
 *         +---+
 * this is |awe|some
 *         +---+
 * -> getText (-3, 3) "is awesom"
 * -> getText (-4, 0) " is awe"
 * -> getText (2, 4)  "esome"
 * 
 * </pre>
 * <b>Note:</b> The cursor itself does not move.
 * @method
 * 
 * @param {itive integer} start Start of the cursor moves this much forward.
 * @param {itive integer} end End of the cursor moves this much forward.
 * @return {string} The text enclosed between the start and end of the cursor after the (imaginary) moving is done.
 */
Cursor.prototype.getText = function (start, end) {};

TextAreaCursor.prototype.getText = function (start, end) {
    var new_start = this.textarea.selectionStart + start;
    var new_end = this.textarea.selectionEnd + end;
    return this.textarea.value.substring (new_start, new_end);
};

ContentEditableCursor.prototype.getText = function (start, end) {
    var range = this.selection.getRangeAt (0);
    return this.selection.anchorNode.textContent.substring (
        range.startOffset + start,
        range.endOffset + end
    );
};
