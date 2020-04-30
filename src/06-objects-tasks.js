/* ************************************************************************************************
 *                                                                                                *
 * Plese read the following tutorial before implementing tasks:                                   *
 * https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/Object_initializer *
 * https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object        *
 *                                                                                                *
 ************************************************************************************************ */

/**
 * Returns the rectagle object with width and height parameters and getArea() method
 *
 * @param {number} width
 * @param {number} height
 * @return {Object}
 *
 * @example
 *    const r = new Rectangle(10,20);
 *    console.log(r.width);       // => 10
 *    console.log(r.height);      // => 20
 *    console.log(r.getArea());   // => 200
 */
function Rectangle(width, height) {
  const rect = {
    width,
    height,
    getArea() {
      return width * height;
    },
  };
  return rect;
}

/**
 * Returns the JSON representation of specified object
 *
 * @param {object} obj
 * @return {string}
 *
 * @example
 *    [1,2,3]   =>  '[1,2,3]'
 *    { width: 10, height : 20 } => '{"height":10,"width":20}'
 */
function getJSON(obj) {
  return JSON.stringify(obj);
}

/**
 * Returns the object of specified type from JSON representation
 *
 * @param {Object} proto
 * @param {string} json
 * @return {object}
 *
 * @example
 *    const r = fromJSON(Circle.prototype, '{"radius":10}');
 *
 */
function fromJSON(proto, json) {
  const obj = Object.setPrototypeOf(JSON.parse(json), proto);
  return obj;
}

/**
 * Css selectors builder
 *
 * Each complex selector can consists of type, id, class, attribute, pseudo-class
 * and pseudo-element selectors:
 *
 *    element#id.class[attr]:pseudoClass::pseudoElement
 *              \----/\----/\----------/
 *              Can be several occurences
 *
 * All types of selectors can be combined using the combinators ' ','+','~','>' .
 *
 * The task is to design a single class, independent classes or classes hierarchy
 * and implement the functionality to build the css selectors using the provided cssSelectorBuilder.
 * Each selector should have the stringify() method to output the string repsentation
 * according to css specification.
 *
 * Provided cssSelectorBuilder should be used as facade only to create your own classes,
 * for example the first method of cssSelectorBuilder can be like this:
 *   element: function(value) {
 *       return new MySuperBaseElementSelector(...)...
 *   },
 *
 * The design of class(es) is totally up to you, but try to make it as simple,
 * clear and readable as possible.
 *
 * @example
 *
 *  const builder = cssSelectorBuilder;
 *
 *  builder.id('main').class('container').class('editable').stringify()
 *    => '#main.container.editable'
 *
 *  builder.element('a').attr('href$=".png"').pseudoClass('focus').stringify()
 *    => 'a[href$=".png"]:focus'
 *
 *  builder.combine(
 *      builder.element('div').id('main').class('container').class('draggable'),
 *      '+',
 *      builder.combine(
 *          builder.element('table').id('data'),
 *          '~',
 *           builder.combine(
 *               builder.element('tr').pseudoClass('nth-of-type(even)'),
 *               ' ',
 *               builder.element('td').pseudoClass('nth-of-type(even)')
 *           )
 *      )
 *  ).stringify()
 *    => 'div#main.container.draggable + table#data ~ tr:nth-of-type(even)   td:nth-of-type(even)'
 *
 *  For more examples see unit tests.
 */

const cssSelectorBuilder = {
  element(value) {
    const builder = new this.MyBuilder();
    return builder.element(value);
  },

  id(value) {
    const builder = new this.MyBuilder();
    return builder.id(value);
  },

  class(value) {
    const builder = new this.MyBuilder();
    return builder.class(value);
  },

  attr(value) {
    const builder = new this.MyBuilder();
    return builder.attr(value);
  },

  pseudoClass(value) {
    const builder = new this.MyBuilder();
    return builder.pseudoClass(value);
  },

  pseudoElement(value) {
    const builder = new this.MyBuilder();
    return builder.pseudoElement(value);
  },

  combine(...args) {
    const combiner = new this.MyCombiner();
    return combiner.combine(...args);
  },
  MyBuilder: class Builder {
    constructor() {
      this.sClass = [];
      this.sAttr = [];
      this.sPseudo = [];
      this.stateVars = {
        sElement: 0,
        sId: 1,
        sClass: 2,
        sAttr: 3,
        sPseudo: 4,
        sPseudoE: 5,
      };
      this.state = new Array(6).fill(false);
    }

    checkState(i) {
      this.state[i] = true;
      for (let j = i + 1; j < this.state.length; j += 1) {
        if (this.state[j]) {
          throw new Error(
            'Selector parts should be arranged in the following order: element, id, class, attribute, pseudo-class, pseudo-element',
          );
        }
      }
    }

    element(v) {
      if (this.sElement) {
        throw new Error(
          'Element, id and pseudo-element should not occur more then one time inside the selector',
        );
      }
      this.sElement = v;
      this.checkState(this.stateVars.sElement);
      return this;
    }

    id(v) {
      if (this.sId) {
        throw new Error(
          'Element, id and pseudo-element should not occur more then one time inside the selector',
        );
      }
      this.sId = v;
      this.checkState(this.stateVars.sId);
      return this;
    }

    class(v) {
      this.sClass.push(v);
      this.checkState(this.stateVars.sClass);
      return this;
    }

    attr(v) {
      this.sAttr.push(v);
      this.checkState(this.stateVars.sAttr);
      return this;
    }

    pseudoClass(v) {
      this.sPseudo.push(v);
      this.checkState(this.stateVars.sPseudo);
      return this;
    }

    pseudoElement(v) {
      if (this.sPseudoE) {
        throw new Error(
          'Element, id and pseudo-element should not occur more then one time inside the selector',
        );
      }
      this.sPseudoE = v;
      this.checkState(this.stateVars.sPseudoE);
      return this;
    }

    stringify() {
      let result = '';
      if (this.sElement) result += this.sElement;
      if (this.sId) result += `#${this.sId}`;
      if (this.sClass.length > 0) {
        result += this.sClass.map((c) => `.${c}`).join('');
      }
      if (this.sAttr.length > 0) result += this.sAttr.map((a) => `[${a}]`).join('');
      if (this.sPseudo.length > 0) result += this.sPseudo.map((p) => `:${p}`).join('');
      if (this.sPseudoE) result += `::${this.sPseudoE}`;
      return result;
    }
  },

  MyCombiner: function Combiner() {
    this.combine = (s1, combiner, s2) => {
      this.s1 = s1;
      this.s2 = s2;
      this.combiner = combiner;
      return this;
    };
    this.stringify = () => `${this.s1.stringify()} ${this.combiner} ${this.s2.stringify()}`;
  },
};

module.exports = {
  Rectangle,
  getJSON,
  fromJSON,
  cssSelectorBuilder,
};
