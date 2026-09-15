function RenderQueue({ canvas }) {
  this.queue = [];
  this.shadow = {
    offset: {
      x: 8,
      y: 8,
    },
    position: {},
    alpha: 0.4,
    scale: 1.05,
    color: "rgba(0,0,0,.2)",
    steps: 2,
  };

  this.texture01 = new TextureObject({ type: "lineSimple" });
  this.texture02 = new TextureObject({ type: "lineSpray" });
  this.texture03 = new TextureObject({ type: "circleGrid" });
  this.texture04 = new TextureObject({ type: "spray" });
  this.texture05 = new TextureObject({ type: "lineGrid" });

  this.textureList = [
    this.makeTexture({ canvas, texture: this.texture01 }),
    this.makeTexture({ canvas, texture: this.texture02 }),
    this.makeTexture({ canvas, texture: this.texture03 }),
    this.makeTexture({ canvas, texture: this.texture04 }),
    this.makeTexture({ canvas, texture: this.texture05 }),
  ];
}

RenderQueue.prototype.getExample = function () {
  return {
    type: "simpleCircle",
    canvas: "canvas Object",
    width: 100,
    position: {
      x: 100,
      y: 100,
    },
    color: "rgba(255,155,100,1)",
    shadow: true,
    texture: true,
    textureNumber: 1,
    opacity: 1,
    string: "TEST",
    effect: "source-over",
  };
};

RenderQueue.prototype.add = function (command) {
  this.queue.push(command);
};

RenderQueue.prototype.update = function () {
  for (let index = 0; index < this.queue.length; index++) {
    const command = this.queue[index];
    this[command.type](command);
  }

  // Keep the queue's backing storage instead of allocating a new array on
  // every animation frame.
  this.queue.length = 0;
};

RenderQueue.prototype.makeTexture = function ({ canvas, texture }) {
  return canvas.createPattern(texture.getElem(), "repeat");
};

RenderQueue.prototype.drawCircle = function (command) {
  const context = command.canvas;
  const shadow = this.shadow;

  context.save();
  context.translate(command.position.x, command.position.y);
  context.rotate((command.rotation * Math.PI) / 180);

  if (command.shadow === true) {
    const shadowStepX = shadow.offset.x / shadow.steps;
    const shadowStepY = shadow.offset.y / shadow.steps;
    const radius = command.width;

    for (let step = 0; step < shadow.steps; step++) {
      context.fillStyle = shadow.color;
      context.beginPath();
      context.arc(
        shadowStepX * step,
        shadowStepY * step,
        radius,
        0,
        2 * Math.PI,
      );
      context.closePath();
      context.fill();
    }
  }

  context.fillStyle = command.color;
  context.beginPath();
  context.arc(0, 0, command.width, 0, 2 * Math.PI);
  context.closePath();
  context.fill();

  if (command.texture === true) {
    context.fillStyle = this.textureList[command.textureNumber];
    context.globalAlpha = 0.25;
    context.beginPath();
    context.arc(0, 0, command.width, 0, 2 * Math.PI);
    context.closePath();
    context.fill();
    context.globalAlpha = 1;
  }

  context.restore();
};

RenderQueue.prototype.drawRect = function (command) {
  const context = command.canvas;
  const shadow = this.shadow;

  context.save();
  context.translate(command.position.x, command.position.y);
  context.rotate((command.rotation * Math.PI) / 180);

  const left = -command.width / 2;
  const top = -command.height;

  if (command.shadow === true) {
    const shadowStepX = shadow.offset.x / shadow.steps;
    const shadowStepY = shadow.offset.y / shadow.steps;
    const shadowHeight = command.height * shadow.scale;
    const shadowWidth = command.width * shadow.scale;

    for (let step = 0; step < shadow.steps; step++) {
      context.fillStyle = shadow.color;
      context.beginPath();
      context.rect(
        left + shadowStepX * step,
        top + shadowStepY * step,
        shadowWidth,
        shadowHeight,
      );
      context.closePath();
      context.fill();
    }
  }

  context.fillStyle = command.color;
  context.beginPath();
  context.rect(left, top, command.width, command.height);
  context.closePath();
  context.fill();

  if (command.texture === true) {
    context.fillStyle = this.textureList[command.textureNumber];
    context.globalAlpha = 0.15;
    context.beginPath();
    context.rect(left, top, command.width, command.height);
    context.closePath();
    context.fill();
    context.globalAlpha = 1;
  }

  context.restore();
};

RenderQueue.prototype.drawTriangle = function (command) {
  const context = command.canvas;
  const shadow = this.shadow;

  context.save();
  context.translate(command.position.x, command.position.y);
  context.rotate((command.rotation * Math.PI) / 180);

  const top = -command.height / 2;
  const left = -command.width / 2;
  const bottom = command.height / 2;
  const right = command.width / 2;

  if (command.shadow === true) {
    const shadowStepX = shadow.offset.x / shadow.steps;
    const shadowStepY = shadow.offset.y / shadow.steps;

    for (let step = 0; step < shadow.steps; step++) {
      const shadowX = shadowStepX * step;
      const shadowY = shadowStepY * step;

      context.fillStyle = shadow.color;
      context.beginPath();
      context.moveTo(shadowX, top + shadowY);
      context.lineTo(left + shadowX, bottom + shadowY);
      context.lineTo(right + shadowX, bottom + shadowY);
      context.closePath();
      context.fill();
    }
  }

  context.fillStyle = command.color;
  context.beginPath();
  context.moveTo(0, top);
  context.lineTo(left, bottom);
  context.lineTo(right, bottom);
  context.closePath();
  context.fill();

  if (command.texture === true) {
    context.fillStyle = this.textureList[command.textureNumber];
    context.globalAlpha = 0.15;
    context.beginPath();
    context.moveTo(0, top);
    context.lineTo(left, bottom);
    context.lineTo(right, bottom);
    context.closePath();
    context.fill();
    context.globalAlpha = 1;
  }

  context.restore();
};

RenderQueue.prototype.clear = function ({ canvas }) {
  canvas.clearRect(0, 0, stage.w, stage.h);
};

RenderQueue.prototype.updateBG = function ({ canvas, bgElem }) {
  canvas.clearRect(0, 0, stage.w, stage.h);
  canvas.drawImage(bgElem, 0, 0, stage.w, stage.h);
};

RenderQueue.prototype.composite = function ({ canvas, bgElem, sourceElem }) {
  canvas.clearRect(0, 0, stage.w, stage.h);
  canvas.drawImage(bgElem, 0, 0, stage.w, stage.h);
  canvas.drawImage(sourceElem, 0, 0, stage.w, stage.h);
};
