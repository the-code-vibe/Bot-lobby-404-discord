import fs from 'fs';
import path, { dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));

const commands = [];
const commandsMap = new Map();

const categories = fs.readdirSync(__dirname, { withFileTypes: true })
  .filter(dirent => dirent.isDirectory())
  .map(dirent => dirent.name);

for (const category of categories) {
  const categoryPath = path.join(__dirname, category);
  const files = fs.readdirSync(categoryPath).filter(f => f.endsWith('.js'));
  for (const file of files) {
    const command = (await import(path.join(categoryPath, file))).default;
    if (command && command.data && command.execute) {
      commands.push(command.data.toJSON());
      commandsMap.set(command.data.name, command);
    }
  }
}

export { commands, commandsMap }; 