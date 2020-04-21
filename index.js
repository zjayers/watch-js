#!/usr/bin/env node
const fs = require('fs');
const chokidar = require('chokidar');
const debounce = require('lodash.debounce');
const program = require('caporal');
const { spawn } = require('child_process');
const chalk = require('chalk');

program
  .version('0.0.1')
  .argument('[filename]', 'Name of a a file to execute')
  .action(async ({ filename }) => {

    // Get the name of the file to run
    const fileToRun = filename || 'index.js';

    // Check if the file exists
    try {
      await fs.promises.access(fileToRun);
    } catch (err) {
      throw new Error(`Could not find the file ${fileToRun}`);
    }

    let proc;
    // Debouced function to start the input file
    const start = debounce(() => {
      if (proc) {
        // Kill last process if existing
        proc.kill();
      }
      // eslint-disable-next-line no-console
      console.log(chalk.green('>>>> Starting Process...'));
      proc = spawn('node', [fileToRun], { stdio: 'inherit' });
    }, 100);

    // File watcher
    chokidar.watch('.')
      .on('add', start)
      .on('change', start)
      .on('unlink', start);
  });

// Begin Program
program.parse(process.argv);
