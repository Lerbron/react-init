#!/usr/bin/env node

const program = require('commander');
const chalk = require('chalk');
const ora = require('ora');
const fs = require('fs');
const inquirer = require('inquirer');
const shell = require('shelljs');
const symbols = require('log-symbols');
const download = require('download-git-repo');
const child_process = require('child_process');
const handlebars = require('handlebars');
const path = require('path');

program.version('1.0.0', '-v, --version')
  .command('init <name>')
  .action(name => {
    console.log(name);

    if (!fs.existsSync(name)) {
      console.log('正在创建项目...');
      inquirer.prompt([
        {
            name: 'description',
            message: '请输入项目描述'
        },
        {
            name: 'author',
            message: '请输入作者名称'
        }
      ]).then(answers => {
        const spinner = ora('正在向下载模板...\n');
        spinner.start();

        download('direct:https://github.com/Lerbron/react-temp.git', name, {clone: true}, err => {
          if (err) {
            spinner.fail();
            console.log(symbols.error, chalk.red('模板下载失败'))
          } else {
            spinner.succeed();
            // shell.mv(__dirname + '/react-temp', __dirname + '/' + name)
            const filename = `${name}/package.json`;
            const meta = {
              name,
              description: answers.description,
              author: answers.author
            }

            if (fs.existsSync(filename)) {
              const content = fs.readFileSync(filename).toString();
              let dt = JSON.parse(content);
              dt.name = '{{name}}';
              dt.description = '{{description}}'
              const result = handlebars.compile(JSON.stringify(dt, null, 2))(meta);
              fs.writeFileSync(filename, result);
              shell.cd(name);
              shell.rm('-rf', '.git');
              console.log(symbols.success, chalk.green('项目初始化完成'));
            } else {
              console.log(symbols.error, chalk.red('package不存在'))
            }
            process.exit()
          }
        })
      })
    } else {
      console.log(symbols.error, chalk.red('项目已存在'));
    }

  })

  program.parse(process.argv);