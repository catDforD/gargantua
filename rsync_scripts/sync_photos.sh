":" //# comment; exec /usr/bin/env node "$0" "$@"

const { existsSync } = require('node:fs');
const { spawnSync } = require('node:child_process');

function printUsage(scriptPath) {
  console.log(`Usage: bash ${scriptPath} [--dry-run] [local_dir]`);
}

function parseArgs(argv) {
  const options = {
    localDir: './photos/',
    dryRun: false
  };

  for (let i = 0; i < argv.length; i += 1) {
    const arg = argv[i];

    if (arg === '--dry-run' || arg === '-n') {
      options.dryRun = true;
      continue;
    }

    if (arg === '--help' || arg === '-h') {
      printUsage('scripts/sync_photos.sh');
      process.exit(0);
    }

    options.localDir = arg;
  }

  return options;
}

function main() {
  // Hexo loads files under scripts/ as JS plugins. Keep this file inert unless
  // it is invoked directly from the command line.
  if (require.main !== module) {
    return;
  }

  const { localDir, dryRun } = parseArgs(process.argv.slice(2));
  const remoteHost = process.env.REMOTE_HOST || 'root@38.55.34.92';
  const remoteDir = process.env.REMOTE_DIR || '/srv/photos/';

  if (!existsSync(localDir)) {
    console.error(`Local album directory not found: ${localDir}`);
    process.exit(1);
  }

  const rsyncArgs = ['-avz', '--delete', '--progress'];
  if (dryRun) {
    rsyncArgs.push('--dry-run');
  }
  rsyncArgs.push(localDir, `${remoteHost}:${remoteDir}`);

  console.log(`Syncing ${localDir} -> ${remoteHost}:${remoteDir}`);

  const result = spawnSync('rsync', rsyncArgs, {
    stdio: 'inherit',
    env: process.env
  });

  if (result.error) {
    if (result.error.code === 'ENOENT') {
      console.error('rsync is not installed or not available in PATH.');
    } else {
      console.error(result.error.message);
    }
    process.exit(1);
  }

  process.exit(result.status ?? 0);
}

main();
