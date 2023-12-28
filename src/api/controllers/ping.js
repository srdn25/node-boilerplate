function checkAlive(app) {
  return (ctx) => {
    ctx.body = {
      message: 'Pong',
    }
  };
}

module.exports = {
  checkAlive,
}