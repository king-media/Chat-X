import util from 'node:util';
import childProcess from 'node:child_process';
import fs from 'node:fs'
import path from 'node:path'
import { isNotBlank } from '@chatx/shared';

const exec = util.promisify(childProcess.exec)

async function zipFiles(execs: childProcess.PromiseWithChild<{ stdout: string; stderr: string; }>[]) {
    try {
        const fileExecResponses = await Promise.all(execs)

        const errors = fileExecResponses.filter(({ stderr }) => isNotBlank(stderr))

        if (isNotBlank(errors)) {
            errors.forEach(error => console.error(error))
        }
    } catch (err) {
        console.error(err)
    }
}

async function build() {
    // clear dist folder
    await exec('rm -rf ./dist')

    // build lambdas
    await exec('esbuild \
    $(find ./src/api/* -type d -name test -prune -false -o -name *.ts) \
    --bundle --minify --sourcemap --platform=node --target=es2020 --outdir=./dist'
    )

    // zip files
    fs.readdirSync(path.resolve('./dist')).forEach(async folderName => {
        const folderPath = path.resolve(`./dist/${folderName}`)
        const fileExecs = fs.readdirSync(folderPath)
            .filter(file => !file.includes('.map')) // exclude map files to maintain zip order
            .map(file => {
                const fileName = path.parse(path.resolve(`./dist/${folderName}/${file}`)).name
                return exec(`cd ${folderPath} && zip -r ${fileName}.zip . -i "${fileName}.*"`)
            })

        await zipFiles(fileExecs)
    })

    await exec("sam build")
}

build()
