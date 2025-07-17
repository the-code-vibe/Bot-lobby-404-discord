import chalk from 'chalk';

function timestamp() {
  return new Date().toISOString();
}

export const logger = {
  info: (msg) => console.log(chalk.blue(`[INFO] [${timestamp()}]`), msg),
  success: (msg) => console.log(chalk.green(`[SUCCESS] [${timestamp()}]`), msg),
  warn: (msg) => console.log(chalk.yellow(`[WARN] [${timestamp()}]`), msg),
  error: (msg) => console.error(chalk.red(`[ERROR] [${timestamp()}]`), msg),
};