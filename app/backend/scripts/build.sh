#!/bin/bash
alias npm-esbuild='./node_modules/esbuild/bin/esbuild'
# clear dist folder
rm -rf ./dist

# build lambdas
npm-esbuild $(find ./src/api/* -name *.ts) --bundle --minify --sourcemap --platform=node --target=es2020 --outdir=./dist

# zip files

handlers=$(find ./src/api/* -name *.ts -exec basename {} .ts ';')

zip_handlers()
{
    for handler in $handlers
    do
        zip "$handler".zip "$handler".js*
    done
}

cd dist/http && zip_handlers
cd ../socket && zip_handlers

cd ../../ && sam build