libcursor
=========

libcursor is a JavaScript library for manipulating cursor inside 
textareas and contenteditable html elements.

### API docs

For API documentation, visit [github pages for libcursor]
(http://sujeetgholap.github.io/libcursor/symbols/Cursor.html "API documentation").

### Sample code
```javascript
/* *
 * Write "Hello world!" with cursor 
 * ending up just after the 'o' in 'Hello' 
 */
cursor = Cursor.new ();
cursor.insert ("world!")
      .moveBackward (6)
      .insert ("Hello")
      .insertAfter (" ");
```
