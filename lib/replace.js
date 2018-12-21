const Readable = require("stream").Readable;
const through = require("through2");

const words = ["源泉徴収票", "印鑑証明書"];
const re = new RegExp(`(${words.join("|")})`, "g");

function replaceFn(...args) {
  return `[${args[0]}](#${args[0]})`;
}

function isStream(stream) {
  return (
    stream !== null &&
    typeof stream === "object" &&
    typeof stream.pipe === "function"
  );
}

module.exports = str => {
  let s = "";

  if (isStream(str)) {
    s = str;

    s.on("end", () => {
      process.exit(0);
    });
  } else {
    s = new Readable();
    s._read = () => {}; // noop
    s.push(str);
    s.push(null); // tell the stream "fineshed"
  }

  s.pipe(
    through(function(chunk, enc, next) {
      this.push(chunk.toString().replace(re, replaceFn));
      next();
    })
  ).pipe(process.stdout);
};
