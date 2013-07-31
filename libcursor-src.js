/**
 * Represents a Cursor.
 * @constructor
 * 
 * @param [DomElement]
 * This must be either an element with contenteditable set to true,
 * or a textarea or an input field.
 * If unspecified, this would return a cursor at the current visible
 * position of the cursor on the page.
 *
 * @param [position]
 * This specifies the position of the cursor in the DomElement.
 * When unspecified, while the DomElement is specified, the resultant
 * cursor will be at the start of the editing area. In case of unspecified
 * DomElement, the cursor at the current visible cursor position will be
 * returned.
 */
function Cursor (DomElement, position) {
    // The case when nothing is specified, just get the current position
    // where cursor is in the document.
    if (arguments.length == 0) {
        // As of now, let us just handle text area.
        if (document.activeElement.nodeName == "TEXTAREA") {
            this.textarea = document.activeElement;
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
    this.textarea.setRangeText (text);
    this.textarea.setSelectionRange (
        this.textarea.selectionStart + text.length,
        this.textarea.selectionStart + text.length
    );
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
    this.textarea.setRangeText (text);
    this.textarea.setSelectionRange (this.textarea.selectionStart,
                                     this.textarea.selectionStart);
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
Cursor.prototype.moveForward = function (offset) {
    this.textarea.setSelectionRange (this.textarea.selectionEnd + offset,
                                     this.textarea.selectionEnd + offset);
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
Cursor.prototype.moveBackward = function (offset) {
    this.textarea.setSelectionRange (this.textarea.selectionStart - offset,
                                     this.textarea.selectionStart - offset);
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
Cursor.prototype.deleteForward = function (amount) {
    this.textarea.setSelectionRange (this.textarea.selectionEnd,
                                     this.textarea.selectionEnd + amount);
    this.textarea.setRangeText ("");
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
Cursor.prototype.deleteBackward = function (amount) {
    this.textarea.setSelectionRange (this.textarea.selectionStart - amount,
                                     this.textarea.selectionStart);
    this.textarea.setRangeText ("");
    return this;
};
