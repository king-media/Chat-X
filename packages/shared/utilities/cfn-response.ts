// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: MIT-0


import https from "https"

export enum ResponseStatus {
    SUCCESS = "SUCCESS",
    FAILED = "FAILED"
}

export type ResponseData = {
    status: ResponseStatus,
    error?: string
}

export const send = (
    event,
    context,
    responseStatus: ResponseStatus,
    responseData: ResponseData,
    physicalResourceId?: string,
    noEcho?) => {

    const responseBody = JSON.stringify({
        Status: responseStatus,
        Reason: "See the details in CloudWatch Log Stream: " + context.logStreamName,
        PhysicalResourceId: physicalResourceId || context.logStreamName,
        StackId: event.StackId,
        RequestId: event.RequestId,
        LogicalResourceId: event.LogicalResourceId,
        NoEcho: noEcho || false,
        Data: responseData
    });

    console.log("Response body:\n", responseBody);

    const parsedUrl = new URL(event.ResponseURL);
    const options = {
        hostname: parsedUrl.hostname,
        port: 443,
        path: parsedUrl.pathname,
        method: "PUT",
        headers: {
            "content-type": "",
            "content-length": responseBody.length
        }
    };

    const request = https.request(options, function (response) {
        console.log("Status code: " + parseInt(String(response.statusCode)));
        context.done();
    });

    request.on("error", function (error) {
        console.log("send(..) failed executing https.request(..): " + error);
        context.done();
    });

    request.write(responseBody);
    request.end();
}