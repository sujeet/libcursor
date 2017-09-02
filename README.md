libcursor
=========
[![Build Status](https://img.shields.io/travis/sujeet/libcursor/gh-pages.svg)](https://travis-ci.org/sujeet/libcursor)
[![Code Climate](https://img.shields.io/codeclimate/github/sujeet/libcursor.svg)](https://codeclimate.com/github/sujeet/libcursor)
[![Test Coverage](https://img.shields.io/codecov/c/github/sujeet/libcursor/gh-pages.svg)](https://codecov.io/gh/sujeet/libcursor)

libcursor is a JavaScript library for manipulating cursor inside 
textareas and contenteditable html elements.

### Using libcursor ([Full API docs](//sujeet.github.io/libcursor/docs/Cursor.html))
##### Include the library:
```HTML
<script 
   type='text/javascript' 
   src='//sujeet.github.io/libcursor/libcursor.js'>
</script>
```

##### Here is a sample piece of code:
```javascript
/**
 * Write "Hello world!" with cursor 
 * ending up just after the 'o' in 'Hello' 
 */
Cursor
  .current()
  .insert("world!")
  .moveBackward(6)
  .insert("Hello")
  .insertAfter(" ");
```
