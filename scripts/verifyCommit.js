const chalk = require('chalk')
chalk.level = 1
// PWD|INIT_CWD是根路径
const msg = require('fs')
  .readFileSync(`${process.env.INIT_CWD}/.git/COMMIT_EDITMSG`, 'utf-8')
  .trim()

const commitRE =
  /^(revert: )?(feat|fix|docs|dx|style|refactor|perf|test|workflow|build|ci|chore|types|wip|release)(\(.+\))?: .{1,50}/

if (!commitRE.test(msg)) {
  console.error(
    `  ${chalk.bgRed.white(' 错误 ')} ${chalk.red(
      `无效的提交消息格式。`
    )}\n\n` +
      chalk.red(`  自动生成更改日志需要正确的提交消息格式。例子:\n\n`) +
      `    ${chalk.green(`feat(compiler): add 'comments' option`)}\n` +
      `    ${chalk.green(
        `fix(v-model): handle events on blur (close #28)`
      )}\n\n` +
      chalk.red(`  See .github/commit-convention.md for more details.\n`)
  )
  process.exit(1)
}
console.log(
  chalk.blue(`${msg}\n`) + chalk.green('commit信息格式正确，给予通过！')
)
