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
      this.position = options.position || 'top';
      var handler = throttle(
        this.position == 'bottom' ? this.onScrollBottom : this.onScrollTop,
        this, options.throttle || 10
      );
      $window.on('scroll', handler);
      $window.on('resize', handler);
    }

    $.extend(ScrollChaser.prototype, {
      state: 'top',  // top, fixed or bottom

      onScrollTop: function (e) {
        this.cache = {};  // cache clear

        if (this.getWrapperHeight() - this.getOuterHeight() <= 0) {
          // No need to chase. Sidebar is taller than main contents.
          return;
        }

        var state, offset = this.getScrollTop() + this.offsetTop;
        if (offset < this.getSentinelTop()) {
          state = 'top';
        } else if (offset + this.getOuterHeight() > this.getSentinelBottom()) {
          state = 'bottom';
        } else {
          state = 'fixed';
        }
        if (this.state === state) return;
        this.transferTo(state);
      },

      onScrollBottom: function (e) {
        this.cache = {};  // cache clear

        if (this.getWrapperHeight() - this.getOuterHeight() <= 0) {
          // No need to chase. Sidebar is taller than main contents.
          return;
        }

        var state, offset;
        offset = this.getScrollTop() + $window.height();
        if (offset > this.getSentinelBottom()) {
          state = 'bottom';
        } else if (offset - this.getOuterHeight() < this.getSentinelTop()) {
          state = 'top';
        } else {
          state = 'fixed';
        }
        if (this.state === state) return;
        this.transferTo(state);
      },

      // State transition methods
      transferTo: function (state) {
        this.state = state;
        var prop;
        if (this.state === 'top') {
          prop = { position: 'relative', top: 0, bottom: '' };
        } else if (this.state === 'bottom') {
          prop = {
            position: 'absolute',
            top: this.getWrapperHeight() - this.getOuterHeight(),
            bottom: ''
          };
        } else {
          if (this.position === 'bottom') {
            prop = { position: 'fixed', top: '', bottom: this.offsetBottom };
          } else {
            prop = { position: 'fixed', top: this.offsetTop, bottom: '' };
          }
        }
        this.$el.css(prop);
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
      })

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
