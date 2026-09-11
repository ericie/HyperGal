var Vector = function(t, r) {
  "undefined" === t && (t = 0), "undefined" === r && (r = 0), this.x = t, this.y = r
};
Vector.prototype.add = function(t) {
  return new Vector(this.x + t.x, this.y + t.y)
}, Vector.prototype.sub = function(t) {
  return new Vector(this.x - t.x, this.y - t.y)
}, Vector.prototype.mul = function(t) {
  return new Vector(this.x * t.x, this.y * t.y)
}, Vector.prototype.div = function(t) {
  return new Vector(this.x / t.x, this.y / t.y)
}, Vector.prototype.mag = function() {
  return Math.sqrt(this.x * this.x + this.y * this.y)
}, Vector.prototype.set = function(t, r) {
  this.x = t, this.y = r
}, Vector.prototype.normalise = function(t) {
  var r = this.mag();
  return new Vector(this.x / r, this.y / r)
}, Vector.prototype.dist = function(t) {
  return Math.sqrt((this.x - t.x) * (this.x - t.x) + (this.y - t.y) * (this.y - t.y))
}, Vector.prototype.limit = function(t) {
  return this.mag() > t ? this.normalise().mul(new Vector(t, t)) : this
};
