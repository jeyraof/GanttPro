#!/usr/bin/env node
var proc = require('child_process')
var child = proc.spawn('electron', [__dirname])
