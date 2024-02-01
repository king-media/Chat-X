
import util from 'node:util';
import childProcess from 'node:child_process';
import { tables } from '../src/utils/dynamodb-config'
import { isBlank } from '@chatx/shared'

// NOTE: Local build is not working
const exec = util.promisify(childProcess.exec)

function mapOptionalProps(props: object | undefined, option: string) {
    if (isBlank(props)) {
        return ''
    }

    return `${option}=${JSON.stringify(props)}`
}

async function setupDbTables() {
    // create tables
    const execList = tables.map(table => {
        const gsIndexes = mapOptionalProps(table.GlobalSecondaryIndexes, '--global-secondary-indexes')
        const provisionedThroughput = mapOptionalProps(table.ProvisionedThroughput, '--provisioned-throughput')

        return exec(`aws dynamodb create-table \
            --table-name=${table.TableName} \
            --key-schema=${JSON.stringify(table.KeySchema)} \
            --attribute-definitions=${JSON.stringify(table.AttributeDefinitions)} \
            ${gsIndexes} \
            ${provisionedThroughput}
        `)
    })

    const tableCreations = await Promise.all(execList)
    // the *entire* stdout and stderr (buffered)
    tableCreations.forEach(creationExec => {
        console.log(`stdout: ${creationExec.stdout}`);
        console.log(`stderr: ${creationExec.stderr}`);
    })
}

async function initLocal() {
    let tableList = []
    try {
        const { stdout: listTablesOut, stderr: listTablesErr } = await exec('aws dynamodb list-tables');
        // the *entire* stdout and stderr (buffered)
        console.log(`stdout: ${listTablesOut}`);
        tableList = JSON.parse(listTablesOut).TableNames
        console.log(`stderr: ${listTablesErr}`);

        if (tableList.length === 0) {
            console.log("Tables don't exist! Initializing tables!")
            await setupDbTables();
        } else {
            console.log("Tables already initialized! Running local instance!")
            const { stdout: buildOut, stderr: buildErr } = await exec('pnpm build')

            console.log(`buildOut: ${buildOut}`);
            console.log(`buildErr: ${buildErr}`);

            const { stdout: localOut, stderr: localErr } = await exec('NODE_ENV=development ENVIRONMENT=development pnpm dev:start')

            console.log(`local dev out: ${localOut}`);
            console.log(`local dev err: ${localErr}`);
        }
    } catch (err) {
        console.error('execution error:', err)
    }
}

initLocal()