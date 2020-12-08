import avaTest  from 'ava';
import { generateRandomAvatar, generateRandomName } from 'lib/utils/users';

avaTest('generateRandomAvatar - success', (t) => {
  const url = generateRandomAvatar({ userName: 'newUser' });
  t.is(url, 'https://avatars.dicebear.com/api/gridy/newUser.svg');
});

avaTest('generateRandomName - success', (t) => {
  const name = generateRandomName();
  
  // user should have a first and last name
  const splitName = name.split(' ');
  t.truthy(splitName.length === 2);

  // each word should have its first letter capitalized
  const [first, last] = splitName;
  t.truthy(first[0] === first[0].toUpperCase());
  t.truthy(last[0] === last[0].toUpperCase());
});