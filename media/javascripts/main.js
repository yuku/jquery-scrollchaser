/*jshint evil: true */

$(function () {
  $('.script').each(function () {
    eval($(this).text());
  });

  SyntaxHighlighter.all();
});
