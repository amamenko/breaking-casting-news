const removeLowercase = (str) => {
  return str
    .split(" ")
    .filter((item) => item !== item.toLowerCase())
    .join(" ");
};

module.exports = { removeLowercase };
