export const randomEthereumAddress = () => {
  const randomBytes = crypto.getRandomValues(new Uint8Array(20));

  // Convert bytes to a hexadecimal string
  const address = Array.from(randomBytes)
    .map((byte) => ("0" + byte.toString(16)).slice(-2)) // Convert to hex and pad with zero
    .join("");

  return "0x" + address; // Prefix with '0x'
};

export const randomString = (length: number) => {
  const characters =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  let result = "";
  for (let i = 0; i < length; i++) {
    const randomIndex = Math.floor(Math.random() * characters.length);
    result += characters[randomIndex];
  }
  return result;
};

export const randomInt = (min: number, max: number) =>
  Math.floor(Math.random() * (max - min)) + min;
