'use strict';

describe('Filter: filter', function() {
  var filter;

  beforeEach(inject(function($filter) {
    filter = $filter('filter');
  }));


  it('should filter by string', function() {
    var items = ['MIsKO', {name: 'shyam'}, ['adam'], 1234];
    expect(filter(items, '').length).toBe(4);
    expect(filter(items, undefined).length).toBe(4);

    expect(filter(items, 'iSk').length).toBe(1);
    expect(filter(items, 'isk')[0]).toBe('MIsKO');

    expect(filter(items, 'yam').length).toBe(1);
    expect(filter(items, 'yam')[0]).toEqual(items[1]);

    expect(filter(items, 'da').length).toBe(1);
    expect(filter(items, 'da')[0]).toEqual(items[2]);

    expect(filter(items, '34').length).toBe(1);
    expect(filter(items, '34')[0]).toBe(1234);

    expect(filter(items, "I don't exist").length).toBe(0);
  });

  it('should filter deep object by string', function() {
    var items = [{person: {name: 'Annet', email: 'annet@example.com'}},
                 {person: {name: 'Billy', email: 'me@billy.com'}},
                 {person: {name: 'Joan', email: {home: 'me@joan.com', work: 'joan@example.net'}}}];
    expect(filter(items, 'me@joan').length).toBe(1);
    expect(filter(items, 'joan@example').length).toBe(1);
  });

  it('should not read $ properties', function() {
    expect(''.charAt(0)).toBe(''); // assumption

    var items = [{$name: 'misko'}];
    expect(filter(items, 'misko').length).toBe(0);
  });


  it('should filter on specific property', function() {
    var items = [{ignore: 'a', name: 'a'}, {ignore: 'a', name: 'abc'}];
    expect(filter(items, {}).length).toBe(2);

    expect(filter(items, {name: 'a'}).length).toBe(2);

    expect(filter(items, {name: 'b'}).length).toBe(1);
    expect(filter(items, {name: 'b'})[0].name).toBe('abc');
  });


  it('should take function as predicate', function() {
    var items = [{name: 'a'}, {name: 'abc', done: true}];
    expect(filter(items, function(i) {return i.done;}).length).toBe(1);
  });


  it('should pass the index to a function predicate', function() {
    var items = [0, 1, 2, 3];

    var result = filter(items, function(value, index) {
      return index % 2 === 0;
    });

    expect(result).toEqual([0, 2]);
  });


  it('should take object as predicate', function() {
    var items = [{first: 'misko', last: 'hevery'},
                 {first: 'adam', last: 'abrons'}];

    expect(filter(items, {first:'', last:''}).length).toBe(2);
    expect(filter(items, {first:'', last:'hevery'}).length).toBe(1);
    expect(filter(items, {first:'adam', last:'hevery'}).length).toBe(0);
    expect(filter(items, {first:'misko', last:'hevery'}).length).toBe(1);
    expect(filter(items, {first:'misko', last:'hevery'})[0]).toEqual(items[0]);
  });


  it('should support predicate object with dots in the name', function() {
    var items = [{'first.name': 'misko', 'last.name': 'hevery'},
                 {'first.name': 'adam', 'last.name': 'abrons'}];

    expect(filter(items, {'first.name':'', 'last.name':''}).length).toBe(2);
    expect(filter(items, {'first.name':'misko', 'last.name':''})).toEqual([items[0]]);
  });


  it('should support deep predicate objects', function() {
    var items = [{person: {name: 'John'}},
                 {person: {name: 'Rita'}},
                 {person: {name: 'Billy'}},
                 {person: {name: 'Joan'}}];
    expect(filter(items, {person: {name: 'Jo'}}).length).toBe(2);
    expect(filter(items, {person: {name: 'Jo'}})).toEqual([
      {person: {name: 'John'}}, {person: {name: 'Joan'}}
    ]);
  });


  it('should support deep expression objects with multiple properties', function() {
    var items = [{person: {name: 'Annet', email: 'annet@example.com'}},
                 {person: {name: 'Billy', email: 'me@billy.com'}},
                 {person: {name: 'Joan', email: 'joan@example.net'}},
                 {person: {name: 'John', email: 'john@example.com'}},
                 {person: {name: 'Rita', email: 'rita@example.com'}}];
    var expr = {person: {name: 'Jo', email: '!example.com'}};

    expect(filter(items, expr).length).toBe(1);
    expect(filter(items, expr)).toEqual([items[2]]);
  });


  it('should match any properties for given "$" property', function() {
    var items = [{first: 'tom', last: 'hevery'},
                 {first: 'adam', last: 'hevery', alias: 'tom', done: false},
                 {first: 'john', last: 'clark', middle: 'tommy'}];
    expect(filter(items, {$: 'tom'}).length).toBe(3);
    expect(filter(items, {$: 'a'}).length).toBe(2);
    expect(filter(items, {$: false}).length).toBe(1);
    expect(filter(items, {$: 10}).length).toBe(0);
    expect(filter(items, {$: 'hevery'})[0]).toEqual(items[0]);
  });


  it('should match any properties in the nested object for given deep "$" property', function() {
    var items = [{person: {name: 'Annet', email: 'annet@example.com'}},
                 {person: {name: 'Billy', email: 'me@billy.com'}},
                 {person: {name: 'Joan', email: 'joan@example.net'}},
                 {person: {name: 'John', email: 'john@example.com'}},
                 {person: {name: 'Rita', email: 'rita@example.com'}}];
    var expr = {person: {$: 'net'}};

    expect(filter(items, expr).length).toBe(2);
    expect(filter(items, expr)).toEqual([items[0], items[2]]);
  });


  it('should match the same level and deeper of a "$" property', function() {
    var items = [{person: {name: 'Annet', email: 'annet@example.com'}},
                 {person: {name: 'Billy', email: 'me@billy.com'}},
                 {person: {name: 'Joan', email: {home: 'me@joan.com', work: 'joan@example.net'}}}];
    var expr = {person: {$: 'net'}};

    expect(filter(items, expr).length).toBe(2);
    expect(filter(items, expr)).toEqual([items[0], items[2]]);
  });


  it('should respect the nesting level of "$"', function() {
    var items = [{supervisor: 'me', person: {name: 'Annet', email: 'annet@example.com'}},
                 {supervisor: 'me', person: {name: 'Billy', email: 'me@billy.com'}},
                 {supervisor: 'me', person: {name: 'Joan', email: 'joan@example.net'}},
                 {supervisor: 'me', person: {name: 'John', email: 'john@example.com'}},
                 {supervisor: 'me', person: {name: 'Rita', email: 'rita@example.com'}}];
    var expr = {$: {$: 'me'}};

    expect(filter(items, expr).length).toBe(1);
    expect(filter(items, expr)).toEqual([items[1]]);
  });


  it('should support boolean properties', function() {
    var items = [{name: 'tom', current: true},
                 {name: 'demi', current: false},
                 {name: 'sofia'}];

    expect(filter(items, {current:true}).length).toBe(1);
    expect(filter(items, {current:true})[0].name).toBe('tom');
    expect(filter(items, {current:false}).length).toBe(1);
    expect(filter(items, {current:false})[0].name).toBe('demi');
  });


  it('should support negation operator', function() {
    var items = ['misko', 'adam'];

    expect(filter(items, '!isk').length).toBe(1);
    expect(filter(items, '!isk')[0]).toEqual(items[1]);
  });


  it('should ignore function properties in items', function() {
    // Own function properties
    var items = [
      {text: 'hello', func: noop},
      {text: 'goodbye'},
      {text: 'kittens'},
      {text: 'puppies'}
    ];
    var expr = {text: 'hello'};

    expect(filter(items, expr).length).toBe(1);
    expect(filter(items, expr)[0]).toBe(items[0]);
    expect(filter(items, expr, true).length).toBe(1);
    expect(filter(items, expr, true)[0]).toBe(items[0]);

    // Inherited function proprties
    function Item(text) {
        this.text = text;
    }
    Item.prototype.func = noop;

    items = [
      new Item('hello'),
      new Item('goodbye'),
      new Item('kittens'),
      new Item('puppies')
    ];

    expect(filter(items, expr).length).toBe(1);
    expect(filter(items, expr)[0]).toBe(items[0]);
    expect(filter(items, expr, true).length).toBe(1);
    expect(filter(items, expr, true)[0]).toBe(items[0]);
  });


  it('should ignore function properties in expression', function() {
    // Own function properties
    var items = [
      {text: 'hello'},
      {text: 'goodbye'},
      {text: 'kittens'},
      {text: 'puppies'}
    ];
    var expr = {text: 'hello', func: noop};

    expect(filter(items, expr).length).toBe(1);
    expect(filter(items, expr)[0]).toBe(items[0]);
    expect(filter(items, expr, true).length).toBe(1);
    expect(filter(items, expr, true)[0]).toBe(items[0]);

    // Inherited function proprties
    function Expr(text) {
        this.text = text;
    }
    Expr.prototype.func = noop;

    expr = new Expr('hello');

    expect(filter(items, expr).length).toBe(1);
    expect(filter(items, expr)[0]).toBe(items[0]);
    expect(filter(items, expr, true).length).toBe(1);
    expect(filter(items, expr, true)[0]).toBe(items[0]);
  });


  it('should consider inherited properties in items', function() {
    function Item(text) {
      this.text = text;
    }
    Item.prototype.doubleL = 'maybe';

    var items = [
      new Item('hello'),
      new Item('goodbye'),
      new Item('kittens'),
      new Item('puppies')
    ];
    var expr = {text: 'hello', doubleL: 'perhaps'};

    expect(filter(items, expr).length).toBe(0);
    expect(filter(items, expr, true).length).toBe(0);

    expr = {text: 'hello', doubleL: 'maybe'};

    expect(filter(items, expr).length).toBe(1);
    expect(filter(items, expr)[0]).toBe(items[0]);
    expect(filter(items, expr, true).length).toBe(1);
    expect(filter(items, expr, true)[0]).toBe(items[0]);
  });


  it('should consider inherited properties in expression', function() {
    function Expr(text) {
      this.text = text;
    }
    Expr.prototype.doubleL = true;

    var items = [
      {text: 'hello', doubleL: true},
      {text: 'goodbye'},
      {text: 'kittens'},
      {text: 'puppies'}
    ];
    var expr = new Expr('e');

    expect(filter(items, expr).length).toBe(1);
    expect(filter(items, expr)[0]).toBe(items[0]);

    expr = new Expr('hello');

    expect(filter(items, expr, true).length).toBe(1);
    expect(filter(items, expr)[0]).toBe(items[0]);
  });


  it('should not be affected by `Object.prototype` when using a string expression', function() {
    Object.prototype.someProp = 'oo';

    var items = [
      createMap(),
      createMap(),
      createMap(),
      createMap()
    ];
    items[0].someProp = 'hello';
    items[1].someProp = 'goodbye';
    items[2].someProp = 'kittens';
    items[3].someProp = 'puppies';

    // Affected by `Object.prototype`
    expect(filter(items, {}).length).toBe(1);
    expect(filter(items, {})[0]).toBe(items[1]);

    expect(filter(items, {$: 'll'}).length).toBe(0);

    // Not affected by `Object.prototype`
    expect(filter(items, 'll').length).toBe(1);
    expect(filter(items, 'll')[0]).toBe(items[0]);

    delete Object.prototype.someProp;
  });


  describe('should support comparator', function() {

    it('not consider `object === "[object Object]"` in non-strict comparison', function() {
      var items = [{test: {}}];
      var expr = '[object';
      expect(filter(items, expr).length).toBe(0);
    });


    it('as equality when true', function() {
      var items = ['misko', 'adam', 'adamson'];
      var expr = 'adam';
      expect(filter(items, expr, true)).toEqual([items[1]]);
      expect(filter(items, expr, false)).toEqual([items[1], items[2]]);

      items = [
        {key: 'value1', nonkey: 1},
        {key: 'value2', nonkey: 2},
        {key: 'value12', nonkey: 3},
        {key: 'value1', nonkey: 4},
        {key: 'Value1', nonkey: 5}
      ];
      expr = {key: 'value1'};
      expect(filter(items, expr, true)).toEqual([items[0], items[3]]);

      items = [
        {key: 1, nonkey: 1},
        {key: 2, nonkey: 2},
        {key: 12, nonkey: 3},
        {key: 1, nonkey: 4}
      ];
      expr = {key: 1};
      expect(filter(items, expr, true)).toEqual([items[0], items[3]]);

      expr = 12;
      expect(filter(items, expr, true)).toEqual([items[2]]);
    });


    it('and use the function given to compare values', function() {
      var items = [
        {key: 1, nonkey: 1},
        {key: 2, nonkey: 2},
        {key: 12, nonkey: 3},
        {key: 1, nonkey: 14}
      ];
      var expr = {key: 10};
      var comparator = function(obj, value) {
        return obj > value;
      };
      expect(filter(items, expr, comparator)).toEqual([items[2]]);

      expr = 10;
      expect(filter(items, expr, comparator)).toEqual([items[2], items[3]]);
    });


    it('and use it correctly with deep expression objects', function() {
      var items = [
        {id: 0, details: {email: 'admin@example.com', role: 'admin'}},
        {id: 1, details: {email: 'user1@example.com', role: 'user'}},
        {id: 2, details: {email: 'user2@example.com', role: 'user'}}
      ];
      var expr, comp;

      expr = {details: {email: 'user@example.com', role: 'adm'}};
      expect(filter(items, expr)).toEqual([]);

      expr = {details: {email: 'admin@example.com', role: 'adm'}};
      expect(filter(items, expr)).toEqual([items[0]]);

      expr = {details: {email: 'admin@example.com', role: 'adm'}};
      expect(filter(items, expr, true)).toEqual([]);

      expr = {details: {email: 'admin@example.com', role: 'admin'}};
      expect(filter(items, expr, true)).toEqual([items[0]]);

      expr = {details: {email: 'user', role: 'us'}};
      expect(filter(items, expr)).toEqual([items[1], items[2]]);

      expr = {id: 0, details: {email: 'user', role: 'us'}};
      expect(filter(items, expr)).toEqual([]);

      expr = {id: 1, details: {email: 'user', role: 'us'}};
      expect(filter(items, expr)).toEqual([items[1]]);

      comp = function(actual, expected) {
        return isString(actual) && isString(expected) && (actual.indexOf(expected) === 0);
      };

      expr = {details: {email: 'admin@example.com', role: 'min'}};
      expect(filter(items, expr, comp)).toEqual([]);

      expr = {details: {email: 'admin@example.com', role: 'adm'}};
      expect(filter(items, expr, comp)).toEqual([items[0]]);
    });
  });
});
