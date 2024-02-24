import { cfnResponse, isNotBlank } from '@chatx/shared'

import fs from 'node:fs'
import path from 'node:path'

import {
    S3Client,
    PutObjectCommand,
    DeleteBucketCommand,
    type PutObjectCommandInput,
    type ServerSideEncryption,
    type PutObjectCommandOutput,
    type DeleteBucketCommandInput
} from '@aws-sdk/client-s3'

export enum S3Request {
    Create = "Create",
    Update = "Update",
    Delete = "Delete"
}

export type ResourceProps = {
    ServiceToken: string
    Bucket: string
    Env: string,
    ServerSideEncryption: ServerSideEncryption
}

const client = new S3Client()

const setChatxContent = async ({ Bucket, Env, ServerSideEncryption }: ResourceProps) => {
    const putFileCommands: Promise<PutObjectCommandOutput>[] = []

    const commonInputs = {
        Tagging: `environment=${Env}&project=chatx`,
        ServerSideEncryption,
        Bucket
    }

    const distInput: PutObjectCommandInput = {
        ...commonInputs,
        Key: "dist/"
    }

    console.log("Creating bucket:", Bucket)

    const distCommand = new PutObjectCommand(distInput)
    const distFolderResponse = await client.send(distCommand)

    if (distFolderResponse.$metadata.httpStatusCode === 200) {
        console.log("Creating asset objects")

        const assetFiles = fs.readdirSync(path.resolve('../dist/assets'))
            .map(file => {
                const fileContent = fs.readFileSync(path.resolve(`../dist/assets/${file}`))
                return { file, fileContent }
            })

        assetFiles.forEach(({ file, fileContent }) => {
            const assetContentInput: PutObjectCommandInput = {
                ...commonInputs,
                Key: `/dist/assets/${file}`,
                Body: fileContent
            }

            const command = new PutObjectCommand(assetContentInput)
            putFileCommands.push(client.send(command))
        })

        console.log("Adding index.html content")

        const indexContent = fs.readFileSync(path.resolve("../dist/index.html"))
        const indexContentInput = {
            ...commonInputs,
            Key: `/dist/index.html`,
            Body: indexContent
        }

        const indexCommand = new PutObjectCommand(indexContentInput)
        putFileCommands.push(client.send(indexCommand))

        console.log("Committing S3 client requests")
        isNotBlank(putFileCommands) && await Promise.all(putFileCommands)
    }
}

const deleteChatxContent = async ({ Bucket, }: ResourceProps) => {
    const deleteInput: DeleteBucketCommandInput = { Bucket }

    const deleteCommand = new DeleteBucketCommand(deleteInput)
    await client.send(deleteCommand)
}

export const handler = async (event, context) => {
    console.log(`Event: ${JSON.stringify(event, null, 2)}`);
    console.log(`Context: ${JSON.stringify(context, null, 2)}`);

    const { RequestType, ResourceProperties } = event
    // NOTE: There are 2 issues:
    // - cfnResponse is not working. A http put request may not be sending
    // - Access Denied when attempting to modify bucket.
    const success = () => cfnResponse.send(
        event,
        context,
        cfnResponse.ResponseStatus.SUCCESS,
        {
            status: cfnResponse.ResponseStatus.SUCCESS
        })
    const failedRequest = () => cfnResponse.send(
        event,
        context,
        cfnResponse.ResponseStatus.FAILED,
        {
            status: cfnResponse.ResponseStatus.FAILED,
            error: `Invalid request given: ${RequestType}`
        })

    switch (RequestType) {
        case S3Request.Create:
        case S3Request.Update:
            try {
                await setChatxContent(ResourceProperties)
                success()
                break;
            } catch (e) {
                console.log(JSON.stringify(e))
                cfnResponse.send(
                    event,
                    context,
                    cfnResponse.ResponseStatus.FAILED,
                    {
                        status: cfnResponse.ResponseStatus.FAILED,
                        error: JSON.stringify(e)
                    })
                break;
            }

        case S3Request.Delete:
            try {
                await deleteChatxContent(ResourceProperties)
                success()
                break;
            } catch (e) {
                console.log(JSON.stringify(e))
                cfnResponse.send(
                    event,
                    context,
                    cfnResponse.ResponseStatus.FAILED,
                    {
                        status: cfnResponse.ResponseStatus.FAILED,
                        error: JSON.stringify(e)
                    })
                break;
            }

        default:
            console.log('Invalid request given')
            failedRequest();
    }
};