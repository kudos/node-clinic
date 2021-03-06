'use strict'

const fs = require('fs')
const path = require('path')
const test = require('tap').test
const cli = require('./cli.js')

test('clinic bubbleprof --collect-only - no issues', function (t) {
  // collect data
  cli({}, [
    'clinic', 'bubbleprof', '--collect-only',
    '--', 'node', '-e', 'setTimeout(() => {}, 100)'
  ], function (err, stdout, stderr, tempdir) {
    t.ifError(err)
    t.ok(/output file is (\d+).clinic-bubbleprof/.test(stdout))
    const dirname = stdout.match(/(\d+.clinic-bubbleprof)/)[1]
    const dirpath = path.resolve(tempdir, dirname)

    // visualize data
    cli({}, [
      'clinic', 'bubbleprof', '--visualize-only', dirpath
    ], function (err, stdout) {
      t.ifError(err)
      t.strictEqual(stdout, `Generated HTML file is ${dirpath}.html\nYou can use this command to upload it:\nclinic upload ${dirpath}\n`)

      // check that HTML file exists
      fs.access(dirpath + '.html', function (err) {
        t.ifError(err)
        t.end()
      })
    })
  })
})

test('clinic bubbleprof --collect-only - missing data', function (t) {
  cli({ relayStderr: false }, [
    'clinic', 'bubbleprof', '--visualize-only', 'missing.clinic-bubbleprof'
  ], function (err, stdout, stderr) {
    t.strictDeepEqual(err, new Error('process exited with exit code 1'))
    t.strictEqual(stdout, '')
    t.ok(stderr.includes('ENOENT: no such file or directory'))
    t.end()
  })
})
