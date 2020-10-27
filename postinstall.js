var dir = require('path').dirname(require.main.filename);
console.log('Add the following to your shell to make a vpn alias'); 
console.log(`alias vpn='${dir}/node_modules/.bin/ts-node ${dir}/index.ts'`);
