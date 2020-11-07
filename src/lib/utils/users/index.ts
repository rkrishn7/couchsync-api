import { stringifyUrl } from 'query-string';
import {
  adjectives,
  animals,
  Config,
  uniqueNamesGenerator,
} from 'unique-names-generator';

export const generateRandomAvatar = ({ userName }: { userName: string }) => {
  /**
   * List of options:
   * @see https://avatars.dicebear.com/
   * Or check out the README of the sprite collection
   */
  const options = {};
  const spriteType = 'gridy';
  const apiUrl = `https://avatars.dicebear.com/api/${spriteType}/${encodeURIComponent(
    userName
  )}.svg`;

  return stringifyUrl({
    url: apiUrl,
    query: options,
  });
};

// TODO: Provide a set of userNames so we don't collide with them
export const generateRandomName = () => {
  const nameConfig = {
    dictionaries: [adjectives, animals],
    separator: ' ',
    style: 'capital',
    length: 2,
  } as Config;

  return uniqueNamesGenerator(nameConfig);
};
