import { randomBytes } from 'crypto'

/**
 * Random String Generator
 *
 * The Math.random function in browsers cannot guarantee maximum uniqueness.
 * decided to use the built-in crypto module in Node.js.
 * However, even with a full set of characters, duplicate strings may still occur,
 * but it provides more available options than Math.random.
 * It currently meets the requirements, and there is no expectation of running out of available strings.
 *
 * Disadvantages of Math.random:
 * It can only generate strings consisting of 0-9 and lowercase letters (a-z).
 * Since Math.random() generates 18 decimal places, it may not fill all 36 characters, resulting in limited randomness for the last few characters.
 * In certain cases, it may return empty values. For example, when the random number is 0, 0.5, 0.25, 0.125, etc.
 *
 * @param length Length of the randomly generated string
 * @return string Generated string
 */
export default function generateRandomString (length = 32): string {
  const numbers = '0123456789'
  const charsLower = 'abcdefghijklmnopqrstuvwxyz'
  const charsUpper = charsLower.toUpperCase()
  // Define matching characters (including all readable characters, excluding symbols)
  const matchChars = numbers + charsLower + charsUpper
  const matchCharsLen = matchChars.length
  // Calculate the maximum byte value that can be generated (256 - 8 (256 % 62 = 8) = 248)
  const maxByte = 256 - (256 % matchCharsLen)
  let randomString = ''
  // Set retries to avoid generating random strings with insufficient length if the crypto-generated byte array exceeds maxByte
  while (randomString.length < length) {
    // Calculate the number of bytes to generate based on the internal crypto rules, ensuring it doesn't exceed maxByte
    const buf = safeRandomBytes(Math.ceil(length * 256 / maxByte))
    randomString = processString(buf, randomString, matchChars, length, maxByte)
  }
  return randomString
}

/** Safely generate random bytes (ensuring crypto-generated byte array is always obtained) */
function safeRandomBytes (length: number): Buffer {
  while (true) {
    try {
      return randomBytes(length)
    } catch (e) {
      continue
    }
  }
}

/** Process the string (generate random string based on the matching characters defined and the random bytes) */
function processString (buf: Buffer, randomString: string, matchChars: string, length: number, maxByte: number): string {
  let string = randomString
  for (let i = 0; i < buf.length && string.length < length; i++) {
    const randomByte = buf.readUInt8(i)
    if (randomByte < maxByte) {
      // Use modulo to get the length of the matching characters and prevent randomByte from exceeding the length
      string += matchChars.charAt(randomByte % matchChars.length)
    }
  }
  return string
}
