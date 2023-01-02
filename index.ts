import { readFileSync } from "fs";
import { commonWords, dayMap } from "./consts";

// 14/08/2022, 8:18 am - Niall Dickin: test message one
// 14/08/2022, 8:20 am - John Smith: test message two

const messageRegex =
  /([\d]{2}\/[\d]{2}\/[\d]{4}, [\d]{1,2}:[\d]{2} (?:am|pm)) - ([A-Za-z\s]+): (.*)/;
const emojiRegex = /\p{Emoji_Presentation}/gu;

const messages = new Map<string, string[]>();
const wordFreq = new Map<string, number>();
const emojiFreq = new Map<string, number>();
const hourFreq = new Map<number, number>();
const dayFreq = new Map<number, number>();

// example timestamp 16/09/2022, 7:55 am
function parseTimestamp(timestamp: string): Date {
  const day = parseInt(timestamp.slice(0, 2));
  const monthIndex = parseInt(timestamp.slice(3, 5)) - 1;
  const year = parseInt(timestamp.slice(6, 10));

  const timeOfDay = timestamp.split(" ")[1].trim();

  let hours = parseInt(timeOfDay.split(":")[0]);
  const minutes = parseInt(timeOfDay.split(":")[1]);

  // convert to 24 hour clock format
  if (timestamp.includes("pm") && hours != 12) hours += 12;

  return new Date(Date.UTC(year, monthIndex, day, hours, minutes));
}

function extractTopX<T>(
  freqArray: Map<T, number>,
  x: number,
  filterArray?: T[]
): [T, number][] {
  const pairs = Array.from(freqArray.entries());
  const filtered = filterArray
    ? pairs.filter(([word]) => !filterArray.includes(word))
    : pairs;
  const sorted = filtered.sort(([, freqA], [, freqB]) => freqB - freqA);
  return sorted.slice(0, x);
}

function processMessage(message: string, sender: string, timestamp?: string) {
  messages.set(sender, (messages.get(sender) ?? []).concat(message));

  if (timestamp) {
    const date = parseTimestamp(timestamp);
    const hour = date.getHours();
    const day = date.getDay();
    hourFreq.set(hour, (hourFreq.get(hour) ?? 0) + 1);
    dayFreq.set(day, (dayFreq.get(day) ?? 0) + 1);
  }

  for (const word of message.split(" ")) {
    const stripped = word.replace(/[^A-Za-z]/g, "").toLowerCase(); // strip to just alphabetic characters
    if (stripped.length > 1) {
      wordFreq.set(stripped, (wordFreq.get(stripped) ?? 0) + 1);
    }

    const matches = word.match(emojiRegex);
    if (matches) {
      for (const emoji of matches) {
        emojiFreq.set(emoji, (emojiFreq.get(emoji) ?? 0) + 1);
      }
    }
  }
}

function main() {
  const data = readFileSync("chat.txt", "utf8");

  const lines = data.split("\n");

  let previousSender: string | undefined;

  for (const line of lines) {
    const match = line.match(messageRegex);

    if (match) {
      const timestamp = match[1];
      const sender = match[2];
      const message = match[3];

      previousSender = sender;

      processMessage(message, sender, timestamp);
    } else if (previousSender && line.length) {
      /* must be a multiline message e.g.
       *
       * Hi, Niall. Hope you're doing well.
       * Best wishes, John
       *
       * in which case we know the sender was the same as the previous message
       * and we can just concat the current line of text as it is until we get a new match
       */

      processMessage(line, previousSender);
    }
  }

  console.log("--------------------------------");
  console.log("TOP 100 MOST COMMON WORDS");
  console.log("--------------------------------");
  const topHundredWords = extractTopX(wordFreq, 100, commonWords);
  for (const [word, freq] of topHundredWords) {
    console.log(`${word}: ${freq}`);
  }

  console.log("--------------------------------");
  console.log("WHO SENT THE MOST MESSAGES");
  console.log("--------------------------------");
  for (const [sender, msgArray] of messages.entries()) {
    console.log(`${sender}: ${msgArray.length}`);
  }

  console.log("--------------------------------");
  console.log("TOP 10 MOST COMMON EMOJIS");
  console.log("--------------------------------");
  const topTenEmojis = extractTopX(emojiFreq, 10);
  for (const [emoji, freq] of topTenEmojis) {
    console.log(`${emoji}: ${freq}`);
  }

  console.log("--------------------------------");
  console.log("TOP 5 MOST BUSY HOURS FOR MESSAGING");
  console.log("--------------------------------");
  const topFiveHours = extractTopX(hourFreq, 5);
  for (const [hour, freq] of topFiveHours) {
    console.log(`${hour}:00 : ${freq}`);
  }

  console.log("--------------------------------");
  console.log("TOP 3 MOST BUSY DAYS OF THE WEEK FOR MESSAGING");
  console.log("--------------------------------");
  const topThreeDays = extractTopX(dayFreq, 3);
  for (const [day, freq] of topThreeDays) {
    console.log(`${dayMap[day]}: ${freq}`);
  }
}

main();
