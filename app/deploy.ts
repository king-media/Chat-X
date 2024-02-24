import util from 'node:util';
import childProcess from 'node:child_process';

const exec = util.promisify(childProcess.exec)

async function deployApp() {
    process.chdir(`${process.cwd()}/app`)
    // build backend
    await exec('cd ./backend && pnpm build')

    // build frontend
    await exec(`cd ./frontend && pnpm build:${process.env.NODE_ENV}`)

    await exec("sam build")
    // deploy env
    if (process.env.NODE_ENV === "development") {
        // return for now
        return
    }
}

deployApp()

