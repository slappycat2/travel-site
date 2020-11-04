exports.handler = functions(event, context, callback) {
  callback(null, {
    statusCode: 200,
    body: "Welcome to the secret area"
  })
}