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

  var index = 0;
  var cache = function (func) {
    var key = (index++).toString();
    return function () {
      if (!this.cache[key]) {
        this.cache[key] = func.apply(this);
      }
      return this.cache[key];
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
      state: 'top',  // top, fixed or bottom

      onScroll: function (e) {
        this.cache = {};  // cache clear

        if (this.getWrapperHeight() - this.getOuterHeight() <= 0) {
          // No need to chase. Sidebar is taller than main contents.
          return;
        }

        var state;
        if (this.getScrollTop() + this.offsetTop < this.getSentinelTop()) {
          state = 'top';
        } else if (this.getWindowBottomOffset() > this.getSentinelBottom()) {
          state = 'bottom';
        } else {
          state = 'fixed';
        }
        if (this.state === state) return;
        this.transferTo(state);
      },

      // State transition methods
      transferTo: function (state) {
        this.state = state;
        if (this.state === 'top') {
          this.$el.css({ position: 'relative', top: 0 });
        } else if (this.state === 'bottom') {
          this.$el.css({
            position: 'absolute',
            top: this.getWrapperHeight() - this.getOuterHeight()
          });
        } else {
          this.$el.css({ position: 'fixed', top: this.offsetTop });
        }
      },

      // Getter methods
      // --------------

      getScrollTop: cache(function () {
        return $window.scrollTop();
      }),

      getWrapperHeight: cache(function () {
        return this.$wrapper.outerHeight();
      }),

      getOuterHeight: cache(function () {
        return this.$el.outerHeight(true) + this.offsetBottom;
      }),

      getSentinelTop: cache(function () {
        return this.sentinel.offset().top;
      }),

      getSentinelBottom: cache(function () {
        return this.$wrapper.offset().top + this.getWrapperHeight()
           + parseInt(this.$wrapper.css('margin-top'));
      }),

      getWindowBottomOffset: function () {
        return this.getScrollTop() + this.offsetTop + this.getOuterHeight();
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
