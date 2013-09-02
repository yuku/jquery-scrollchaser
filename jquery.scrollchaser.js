/*!
 * jQuery.scrollChaser.js
 *
 * Repositiory: https://github.com/yuku-t/jquery-scrollchaser
 * License:     MIT
 * Author:      Yuku Takahashi
 */

;(function ($) {

  'use strict';

  var $window = $(window);

  var throttle = function (func, context, wait) {
    var previous = 0;
    return function () {
      var now, remaining;
      now = new Date();
      remaining = wait - (now - previous);
      if (remaining <= 0) {
        previous = now;
        return func.apply(context, arguments);
      }
    };
  };

  var ScrollChaser = (function () {

    function ScrollChaser($el, options) {
      this.$el = $el;
      this.$el.css({ width: this.$el.width() });
      this.$wrapper = options.wrapper;
      if (this.$wrapper.css('position') === 'static') {
        this.$wrapper.css('position', 'relative');
      }
      this.sentinel = $('<span></span>').css({ position: 'relative', height: 0 }),
      this.$el.before(this.sentinel);
      this.offsetTop = options.offsetTop || 0;
      this.offsetBottom = options.offsetBottom || 0;
      var handler = throttle(this.onScroll, this, options.throttle || 10);
      $window.on('scroll', handler);
      $window.on('resize', handler);
    }

    $.extend(ScrollChaser.prototype, {
      index: 0,
      state: 'top',  // top, fixed or bottom

      onScroll: function (e) {
        var sentinelTop, sentinelBottom, scrollTop, outerHeight, wrapperHeight;
        sentinelTop = this.sentinel.offset().top;
        scrollTop = $window.scrollTop();
        if (scrollTop + this.offsetTop < sentinelTop) {
          if (this.state !== 'top') {
            this.$el.css({
              position: 'relative',
              top: 0
            });
            this.state = 'top';
          }
          return;
        }

        wrapperHeight = this.$wrapper.outerHeight();
        sentinelBottom = this.$wrapper.offset().top + wrapperHeight
           + parseInt(this.$wrapper.css('margin-top'));
        outerHeight = this.$el.outerHeight(true) + this.offsetBottom;
        if (this.state = 'top') {
          if (sentinelBottom - sentinelTop - outerHeight <= 0) {
            // No need to chase. Sidebar is taller than main contents.
            return;
          }
        }

        if (scrollTop + this.offsetTop + outerHeight > sentinelBottom) {
          if (this.state !== 'bottom') {
            this.$el.css({
              position: 'absolute',
              top: wrapperHeight - outerHeight
            });
            this.state = 'bottom';
          }
        } else {
          if (this.state !== 'fixed') {
            this.$el.css({
              position: 'fixed',
              top: this.offsetTop
            });
            this.state = 'fixed';
          }
        }
      }
    });

    return ScrollChaser;
  })();

  $.fn.scrollChaser = function (options) {
    options || (options = {});
    if (!options.wrapper) {
      options.wrapper = $(document.body);
    } else if (!(options.wrapper instanceof $)) {
      options.wrapper = $(options.wrapper);
    }
    new ScrollChaser(this, options);
    return this;
  };

})(jQuery);
